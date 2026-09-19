import { Request, Response } from 'express';
import { RequestService } from '../services/request.service';
import { HospitalService } from '../services/hospital.service';

export const createBloodRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    // Determine hospital profile for creating user
    let hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      const hospitalProfile = await HospitalService.getProfileByUserId(req.user.id);
      if (!hospitalProfile) {
        res.status(400).json({
          success: false,
          error: { code: 'HOSPITAL_PROFILE_REQUIRED', message: 'User must create a hospital profile before submitting blood requests' },
        });
        return;
      }
      hospitalId = hospitalProfile.id;
    }

    const bloodRequest = await RequestService.createRequest({
      hospitalId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: bloodRequest,
      message: 'Blood request created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CREATE_REQUEST_FAILED', message: error?.message || 'Failed to create blood request' },
    });
  }
};

export const getBloodRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await RequestService.getRequests(req.query as any);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GET_REQUESTS_FAILED', message: error?.message || 'Failed to fetch blood requests' },
    });
  }
};

export const getBloodRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const bloodRequest = await RequestService.getRequestById(id);

    if (!bloodRequest) {
      res.status(404).json({
        success: false,
        error: { code: 'REQUEST_NOT_FOUND', message: `Blood request with ID ${id} not found` },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: bloodRequest,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GET_REQUEST_FAILED', message: error?.message },
    });
  }
};

export const updateBloodRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const hospitalId = req.user.hospitalId || '';
    const isAdmin = req.user.role === 'ADMIN';

    const updated = await RequestService.updateRequest(id, hospitalId, req.body, isAdmin);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Blood request updated successfully',
    });
  } catch (error: any) {
    if (error?.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Blood request not found' } });
      return;
    }

    if (error?.message === 'FORBIDDEN_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to update another hospital\'s request' } });
      return;
    }

    if (error?.message === 'TERMINAL_STATE_CANNOT_EDIT') {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Fulfilled or cancelled requests cannot be modified' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'UPDATE_REQUEST_FAILED', message: error?.message },
    });
  }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status } = req.body;
    const hospitalId = req.user.hospitalId || '';
    const isAdmin = req.user.role === 'ADMIN';

    const updated = await RequestService.transitionStatus(id, hospitalId, status, isAdmin);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Request status transitioned to ${status}`,
    });
  } catch (error: any) {
    if (error?.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Blood request not found' } });
      return;
    }

    if (error?.message === 'FORBIDDEN_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to change status of another hospital\'s request' } });
      return;
    }

    if (error?.message?.startsWith('INVALID_STATUS_TRANSITION')) {
      const details = error.message.split(':')[1];
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: `Illegal request status transition: ${details}` },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'TRANSITION_STATUS_FAILED', message: error?.message },
    });
  }
};

export const deleteBloodRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const hospitalId = req.user.hospitalId || '';
    const isAdmin = req.user.role === 'ADMIN';

    await RequestService.deleteRequest(id, hospitalId, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully',
    });
  } catch (error: any) {
    if (error?.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Blood request not found' } });
      return;
    }

    if (error?.message === 'FORBIDDEN_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to cancel another hospital\'s request' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'DELETE_REQUEST_FAILED', message: error?.message },
    });
  }
};
