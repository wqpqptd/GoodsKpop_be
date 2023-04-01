const mongoose = require("mongoose");
const validateMonggodbId = (id) =>{
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error("This id is not valid or not found");
;}


module.exports = validateMonggodbId;