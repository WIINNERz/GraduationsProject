export const getRoomId = (userId1,userId2) =>{
    // const sortdIds = [userId1,userId2].sort();
    const sortedIds = [String(userId1), String(userId2)].sort((a, b) => a.localeCompare(b));
    const roomId = sortedIds.join('_');
    return roomId;
}
export const getPetId = (petId) =>{
    return petId;
}