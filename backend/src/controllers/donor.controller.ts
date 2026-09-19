import { Request, Response } from 'express';
import { DonorService } from '../services/donor.service';

export const createDonorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const profile = await DonorService.createProfile({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Donor profile created successfully',
    });
  } catch (error: any) {
    if (error?.message === 'DONOR_PROFILE_EXISTS') {
      res.status(409).json({
        success: false,
        error: { code: 'PROFILE_EXISTS', message: 'Donor profile already exists for this user account' },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'CREATE_DONOR_FAILED', message: error?.message || 'Failed to create donor profile' },
    });
  }
};

export const getMyDonorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const profile = await DonorService.getProfileByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'DONOR_NOT_FOUND', message: 'No donor profile found for current user' },
      });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'GET_DONOR_FAILED', message: error?.message } });
  }
};

export const getDonorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const profile = await DonorService.getProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'DONOR_NOT_FOUND', message: `Donor with ID ${id} not found` },
      });
      return;
    }

    // Privacy mask: reveal user phone only if requester is admin or authorized
    const isOwner = req.user?.id === profile.userId;
    const isAdmin = req.user?.role === 'ADMIN';

    const safeProfile = {
      ...profile,
      user: {
        id: profile.user.id,
        name: profile.user.name,
        email: isOwner || isAdmin ? profile.user.email : undefined,
        phone: isOwner || isAdmin ? profile.user.phone : undefined,
      },
    };

    res.status(200).json({ success: true, data: safeProfile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'GET_DONOR_FAILED', message: error?.message } });
  }
};

export const updateMyDonorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const updated = await DonorService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Donor profile updated successfully',
    });
  } catch (error: any) {
    if (error?.message === 'DONOR_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'DONOR_NOT_FOUND', message: 'Donor profile does not exist' } });
      return;
    }

    res.status(500).json({ success: false, error: { code: 'UPDATE_DONOR_FAILED', message: error?.message } });
  }
};

export const updateMyAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const { availabilityStatus } = req.body;
    const updated = await DonorService.updateAvailability(req.user.id, availabilityStatus);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Donor availability updated to ${availabilityStatus}`,
    });
  } catch (error: any) {
    if (error?.message === 'DONOR_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'DONOR_NOT_FOUND', message: 'Donor profile does not exist' } });
      return;
    }

    res.status(500).json({ success: false, error: { code: 'UPDATE_AVAILABILITY_FAILED', message: error?.message } });
  }
};
