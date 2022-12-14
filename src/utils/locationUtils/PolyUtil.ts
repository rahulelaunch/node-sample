import { LatLng, isEqual } from './LatLng'
import { toRadians } from './MathUtil'
import { computeDistanceBetween } from './SphericalUtil'

/**
 * Returns true if the provided list of points is a closed polygon (i.e., the first and last
 * points are the same), and false if it is not
 * @param poly polyline or polygon
 * @return true if the provided list of points is a closed polygon (i.e., the first and last
 * points are the same), and false if it is not
 */
export function isClosedPolygon(poly: LatLng[]) {
  const firstPoint = poly[0]
  const lastPoint = poly[poly.length-1]
  return isEqual(firstPoint, lastPoint)
}

/**
 * Computes the distance on the sphere between the point p and the line segment start to end.
 *
 * @param p the point to be measured
 * @param start the beginning of the line segment
 * @param end the end of the line segment
 * @return the distance in meters (assuming spherical earth)
 */
export function distanceToLine(p: LatLng, start: LatLng, end: LatLng): number {
  if (isEqual(start, end)) {
      return computeDistanceBetween(end, p)
  }

  const s0lat: number = toRadians(p.latitude)
  const s0lng: number = toRadians(p.longitude)
  const s1lat: number = toRadians(start.latitude)
  const s1lng: number = toRadians(start.longitude)
  const s2lat: number = toRadians(end.latitude)
  const s2lng: number = toRadians(end.longitude)

  const s2s1lat = s2lat - s1lat
  const s2s1lng = s2lng - s1lng
  const u: number = ((s0lat - s1lat) * s2s1lat + (s0lng - s1lng) * s2s1lng)
          / (s2s1lat * s2s1lat + s2s1lng * s2s1lng)
  if (u <= 0) {
      return computeDistanceBetween(p, start)
  }
  if (u >= 1) {
      return computeDistanceBetween(p, end)
  }
  const sa = {latitude: p.latitude - start.latitude, longitude: p.longitude - start.longitude}
  const sb = {latitude: u * (end.latitude - start.latitude), longitude: u * (end.longitude - start.longitude)}
  return computeDistanceBetween(sa, sb)
}

/**
 * Decodes an encoded path string into a sequence of LatLngs.
 */
export function decode(encodedPath: string): LatLng[] {
  const len = encodedPath.length

  const path: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < len) {
    let result = 1
    let shift = 0
    let b: number
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lat += (result & 1) != 0 ? ~(result >> 1) : (result >> 1)

    result = 1
    shift = 0
    do {
      b = encodedPath.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lng += (result & 1) != 0 ? ~(result >> 1) : (result >> 1)

    path.push({latitude: lat * 1e-5, longitude: lng * 1e-5})
  }

  return path
}

/**
 * Encodes a sequence of LatLngs into an encoded path string.
 */
export function encode(path: LatLng[]): string {
  function encode(v: number, result: Buffer[]) {
    v = v < 0 ? ~(v << 1) : v << 1
    while (v >= 0x20) {
      result.push(Buffer.from(String.fromCodePoint((0x20 | (v & 0x1f)) + 63)))
      v >>= 5
    }
    result.push(Buffer.from(String.fromCodePoint(v + 63)))
  }

  let lastLat = 0
  let lastLng = 0

  const result: Buffer[] = []

  path.forEach(point => {
    const lat = Math.round(point.latitude * 1e5)
    const lng = Math.round(point.longitude * 1e5)

    const dLat = lat - lastLat
    const dLng = lng - lastLng

    encode(dLat, result)
    encode(dLng, result)

    lastLat = lat
    lastLng = lng
  })
  return Buffer.concat(result).toString()
}

/**
 * Simplifies the given poly (polyline or polygon) using the Douglas-Peucker decimation
 * algorithm.  Increasing the tolerance will result in fewer points in the simplified polyline
 * or polygon.
 *
 * When the providing a polygon as input, the first and last point of the list MUST have the
 * same latitude and longitude (i.e., the polygon must be closed).  If the input polygon is not
 * closed, the resulting polygon may not be fully simplified.
 *
 * The time complexity of Douglas-Peucker is O(n^2), so take care that you do not call this
 * algorithm too frequently in your code.
 *
 * @param poly polyline or polygon to be simplified.  Polygon should be closed (i.e.,
 *              first and last points should have the same latitude and longitude).
 * @param tolerance in meters.  Increasing the tolerance will result in fewer points in the
 *                  simplified poly.
 * @return a simplified poly produced by the Douglas-Peucker algorithm
 */
export function simplify(poly: LatLng[], tolerance: number): LatLng[] {
  const n = poly.length
  if (n < 1) {
      throw new Error("Polyline must have at least 1 point")
  }
  if (tolerance <= 0) {
      throw new Error("Tolerance must be greater than zero")
  }

  const closedPolygon: boolean = isClosedPolygon(poly)
  let lastPoint: LatLng|null = null

  // Check if the provided poly is a closed polygon
  if (closedPolygon) {
      // Add a small offset to the last point for Douglas-Peucker on polygons (see #201)
      const OFFSET = 0.00000000001
      lastPoint = poly[poly.length - 1]
      // LatLng.latitude and .longitude are immutable, so replace the last point
      poly.splice(poly.length - 1, 1)
      poly.push({latitude: lastPoint.latitude + OFFSET, longitude: lastPoint.longitude + OFFSET})
  }

  let idx: number
  let maxIdx = 0
  const stack: [number, number][] = []
  const dists = new Array<number>(n)
  dists[0] = 1
  dists[n - 1] = 1
  let maxDist: number
  let dist = 0.0
  let current: [number, number]

  if (n > 2) {
      let stackVal: [number, number] = [0, (n - 1)]
      stack.push(stackVal)
      while (stack.length > 0) {
          current = stack.pop()!
          maxDist = 0
          for (idx = current[0] + 1; idx < current[1]; ++idx) {
              dist = distanceToLine(poly[idx], poly[current[0]], poly[current[1]])
              if (dist > maxDist) {
                  maxDist = dist
                  maxIdx = idx
              }
          }
          if (maxDist > tolerance) {
              dists[maxIdx] = maxDist
              const stackValCurMax: [number, number] = [current[0], maxIdx]
              stack.push(stackValCurMax)
              const stackValMaxCur: [number, number] = [maxIdx, current[1]]
              stack.push(stackValMaxCur)
          }
      }
  }

  if (closedPolygon) {
      // Replace last point w/ offset with the original last point to re-close the polygon
      poly.splice(poly.length - 1, 1)
      poly.push(lastPoint!)
  }

  // Generate the simplified line
  return poly.filter((l, idx) => dists[idx])
}
