const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.0.138:3000',
    'https://0f87-136-232-118-126.in.ngrok.io',
    'https://c6b8-136-232-118-126.ngrok.io'
];

const corsOptions = {
    // origin:true,
    origin: (origin:any, callback:Function) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions;