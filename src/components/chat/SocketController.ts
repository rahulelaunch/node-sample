const userMap:any = {};

export const connectionHandler = async (socket: any) => {
    let userId = socket.handshake.query['userId']?.toString() ?? "0"
 
    userMap[userId] = socket.id

    console.log('a user connected', socket.id);

    /**
     * @description: typing event handler
     * @param {type} userId
    */
   socket.on("typing", async (data:any) => {
       if (typeof data == 'string') data = JSON.parse(data)
        let toUser = data.to ?? ""
        socket.to(toUser)?.emit("typing", data)
    })
    
    
    /**
     * @description: when server disconnects from user
    */
    socket.on('disconnect', () => {
        console.log('disconnected from user');
    });
}