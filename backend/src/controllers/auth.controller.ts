import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const { name, phone, role } = req.body;
    const user = await AuthService.syncUser(req.user.id, req.user.email, name, role, phone);

    res.status(200).json({
      success: true,
      data: user,
      message: 'User profile synchronized successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SYNC_FAILED', message: error?.message || 'Failed to sync user' },
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const userProfile = await AuthService.getUserProfile(req.user.id);

    if (!userProfile) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User record not found in database. Please sync user profile first.' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GET_ME_FAILED', message: error?.message || 'Failed to fetch user' },
    });
  }
};
