export const getRoomId = (userId1,userId2) =>{
    const sortdIds = [userId1,userId2].sort();
    const roomId = sortdIds.join('_');
    return roomId;
}
export const getPetId = (petId) =>{
    return petId;
}