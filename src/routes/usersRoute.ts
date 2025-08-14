import express from 'express';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthorizedUsersController } from '../controllers/usersController';
const router = express.Router();
const authorizedUsersController = new AuthorizedUsersController();


const validateDiscordId: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const discordId = req.params.discordId || req.body.discordId;

  if (discordId && !/^\d{17,19}$/.test(discordId)) {
    res.status(400).json({
      success: false,
      error: 'Discord ID deve conter apenas números e ter entre 17-19 dígitos',
    });
    return; 
  }

  next(); 
};

router.get('/check/:discordId', validateDiscordId, authorizedUsersController.checkUserAuthorization);
router.post('/authorize', validateDiscordId, authorizedUsersController.authorizeUser);
router.delete('/unauthorize/:discordId', validateDiscordId, authorizedUsersController.unauthorizeUser);
router.get('/authorized', authorizedUsersController.listAuthorizedUsers);

router.get('/discord/:discordId', validateDiscordId, authorizedUsersController.getDiscordUserInfo);
router.get('/profile/:discordId', validateDiscordId, authorizedUsersController.getUserProfile);

export default router;
