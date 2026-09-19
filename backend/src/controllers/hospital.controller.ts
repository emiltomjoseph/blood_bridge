import { Request, Response } from 'express';
import { HospitalService } from '../services/hospital.service';

export const createHospitalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const profile = await HospitalService.createProfile({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Hospital profile created successfully',
    });
  } catch (error: any) {
    if (error?.message === 'HOSPITAL_PROFILE_EXISTS') {
      res.status(409).json({
        success: false,
        error: { code: 'PROFILE_EXISTS', message: 'Hospital profile already exists for this account' },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'CREATE_HOSPITAL_FAILED', message: error?.message || 'Failed to create hospital profile' },
    });
  }
};

export const getMyHospitalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const profile = await HospitalService.getProfileByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: 'No hospital profile found for current user' },
      });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'GET_HOSPITAL_FAILED', message: error?.message } });
  }
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const profile = await HospitalService.getProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'HOSPITAL_NOT_FOUND', message: `Hospital with ID ${id} not found` },
      });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'GET_HOSPITAL_FAILED', message: error?.message } });
  }
};

export const updateMyHospitalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const updated = await HospitalService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Hospital profile updated successfully',
    });
  } catch (error: any) {
    if (error?.message === 'HOSPITAL_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'HOSPITAL_NOT_FOUND', message: 'Hospital profile does not exist' } });
      return;
    }

    res.status(500).json({ success: false, error: { code: 'UPDATE_HOSPITAL_FAILED', message: error?.message } });
  }
};
