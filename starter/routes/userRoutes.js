const express = require('express')
const fs = require('fs')
const {getAllUsers, postUser, getUser, updateUser, deleteUser} = require('./../controllers/userController')

const router = express.Router()

router
    .route('/')
    .get(getAllUsers)
    .post(postUser)

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

    module.exports = router;