import { AppStrings } from "./appStrings";
import { TrustLevel } from "./enum";

export function myTrustLevel(userImage: number, userIdNumber: number, threeXRef: number, homeAddress: number): number {
  return userImage * 1000 + userIdNumber * 100 + threeXRef * 10 + homeAddress;
}

export const calculateTrust = (level:number,type:number=1) =>{
  const digits = level.toString().split('');
  const realDigits = digits.map(Number).sort((a, b) => a - b);
  const sortedNum = parseInt(realDigits.join(''))

  // const part = [1111,1481,1851,2222,2592,2962,3333];
  let result;

  switch (true) {
    case sortedNum >= 1111 && sortedNum < 1481:
      result = TrustLevel.NOT_TRUSTED
      break;
    case sortedNum > 1481 && sortedNum < 1851:
      result = TrustLevel.AVERAGE_TRUST
      break; 
    case sortedNum > 1851 && sortedNum < 2222:
      result = TrustLevel.NOT_VERIFIED
      break;
    case sortedNum >= 2222 && sortedNum < 2592:
      result = TrustLevel.ABOVE_AVERAGE_TRUST
      break;
    case sortedNum > 2592 && sortedNum < 2962:
      result = TrustLevel.ALMOST_TRUST
      break;
    case sortedNum > 2962 && sortedNum <= 3333:
      result = TrustLevel.SUPER_TRUSTED
      break;
    default:
      return 'not in range'
  }
  return result;

}

export function trustLevelStars(level: number, type:number = 1) {
  if(type ===1)return status[level];
  
  switch (status[level]) {
    case TrustLevel.NOT_TRUSTED:
      return AppStrings.NOT_TRUSTED;
    case TrustLevel.AVERAGE_TRUST:
      return AppStrings.AVG_TRUSTED;
    case TrustLevel.NOT_VERIFIED:
      return AppStrings.NOT_VERIFIED;
    case TrustLevel.ABOVE_AVERAGE_TRUST:
      return AppStrings.ABOVE_AVERAGE_TRUST
    case TrustLevel.ALMOST_TRUST:
      return AppStrings.ALMOST_TRUST
    case TrustLevel.SUPER_TRUSTED:
      return AppStrings.SUPER_TRUSTED
    default:
      break;
  }
}

let status: { [key: number]: TrustLevel } = {
  // Valid(3) vs Invalid(2)
  2222: TrustLevel.NOT_TRUSTED,
  3222: TrustLevel.NOT_TRUSTED,
  2322: TrustLevel.NOT_TRUSTED,
  3322: TrustLevel.AVERAGE_TRUST,
  2232: TrustLevel.NOT_TRUSTED,
  3232: TrustLevel.NOT_TRUSTED,
  2332: TrustLevel.NOT_TRUSTED,
  3332: TrustLevel.AVERAGE_TRUST,
  2223: TrustLevel.NOT_TRUSTED,
  3223: TrustLevel.NOT_TRUSTED,
  2323: TrustLevel.NOT_TRUSTED,
  3323: TrustLevel.ABOVE_AVERAGE_TRUST,
  2233: TrustLevel.NOT_TRUSTED,
  3233: TrustLevel.NOT_TRUSTED,
  2333: TrustLevel.NOT_TRUSTED,
  3333: TrustLevel.SUPER_TRUSTED,

  // Pending(1) vs Valid(3)
  1111: TrustLevel.NOT_VERIFIED,
  3111: TrustLevel.ALMOST_TRUST,
  1311: TrustLevel.ALMOST_TRUST,
  3311: TrustLevel.AVERAGE_TRUST,
  1131: TrustLevel.ALMOST_TRUST,
  3131: TrustLevel.ALMOST_TRUST,
  1331: TrustLevel.ALMOST_TRUST,
  3331: TrustLevel.ABOVE_AVERAGE_TRUST,
  1113: TrustLevel.ALMOST_TRUST,
  3113: TrustLevel.ABOVE_AVERAGE_TRUST,
  1313: TrustLevel.ABOVE_AVERAGE_TRUST,
  3313: TrustLevel.ABOVE_AVERAGE_TRUST,
  1133: TrustLevel.ABOVE_AVERAGE_TRUST,
  3133: TrustLevel.ABOVE_AVERAGE_TRUST,
  1333: TrustLevel.ABOVE_AVERAGE_TRUST,

  // Invalid(2) vs Pending/Not Submitted(1)
  2111: TrustLevel.NOT_VERIFIED,
  1211: TrustLevel.NOT_VERIFIED,
  2211: TrustLevel.NOT_TRUSTED,
  1121: TrustLevel.NOT_VERIFIED,
  2121: TrustLevel.NOT_TRUSTED,
  1221: TrustLevel.NOT_TRUSTED,
  2221: TrustLevel.NOT_TRUSTED,
  1112: TrustLevel.ALMOST_TRUST,
  2112: TrustLevel.NOT_TRUSTED,
  1212: TrustLevel.NOT_TRUSTED,
  2212: TrustLevel.NOT_TRUSTED,
  1122: TrustLevel.NOT_TRUSTED,
  2122: TrustLevel.NOT_TRUSTED,
  1222: TrustLevel.NOT_TRUSTED,

  // EXTRA COMBINATIONS - Pending(1) vs Invalid(2) vs Accepted(3)
  1132: TrustLevel.ALMOST_TRUST,
  1213: TrustLevel.ALMOST_TRUST,
  1223: TrustLevel.ALMOST_TRUST,
  1231: TrustLevel.ALMOST_TRUST,
  1232: TrustLevel.NOT_TRUSTED,
  1233: TrustLevel.ALMOST_TRUST,
  1312: TrustLevel.ALMOST_TRUST,
  1321: TrustLevel.ALMOST_TRUST,
  1323: TrustLevel.AVERAGE_TRUST,
  1332: TrustLevel.AVERAGE_TRUST,
  3112: TrustLevel.ALMOST_TRUST,
  3121: TrustLevel.ALMOST_TRUST,
  3123: TrustLevel.AVERAGE_TRUST,
  3132: TrustLevel.ALMOST_TRUST,
  3211: TrustLevel.ALMOST_TRUST,
  3212: TrustLevel.NOT_TRUSTED,
  3213: TrustLevel.ALMOST_TRUST,
  3221: TrustLevel.NOT_TRUSTED,
  3231: TrustLevel.ALMOST_TRUST,
  3312: TrustLevel.AVERAGE_TRUST,
  3321: TrustLevel.AVERAGE_TRUST,
  2113: TrustLevel.ALMOST_TRUST,
  2123: TrustLevel.NOT_TRUSTED,
  2131: TrustLevel.ALMOST_TRUST,
  2132: TrustLevel.NOT_TRUSTED,
  2133: TrustLevel.AVERAGE_TRUST,
  2213: TrustLevel.NOT_TRUSTED,
  2231: TrustLevel.NOT_TRUSTED,
};

// console.log(calculateTrust(1311,2));

