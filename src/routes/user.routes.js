import { userController } from '#controllers/user.controller.js';
import express from 'express';
import { authenticate, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, userController.getUsers);

router.get('/:id', authenticate, userController.getUserById);

router.post('/', (req, res) => {
    const userData = req.body;
    res.send(`User data received: ${JSON.stringify(userData)}`);
});

router.put('/:id', authenticate, userController.updateUser);

router.delete(
    '/:id',
    authenticate,
    requireRole('admin'),
    userController.deleteUser
);

export default router;
