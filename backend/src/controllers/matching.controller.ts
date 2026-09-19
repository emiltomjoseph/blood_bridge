import { Request, Response } from 'express';
import { MatchingService } from '../services/matching/matching.service';

export const runMatchingForRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const requestId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const hospitalId = req.user.hospitalId || '';
    const isAdmin = req.user.role === 'ADMIN';

    const matches = await MatchingService.findAndCreateMatches(requestId, hospitalId, isAdmin);

    res.status(200).json({
      success: true,
      data: {
        requestId,
        totalMatches: matches.length,
        matches,
      },
      message: `Matching engine executed. Identified ${matches.length} compatible, eligible, and ranked donors.`,
    });
  } catch (error: any) {
    if (error?.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Blood request not found' } });
      return;
    }
    if (error?.message === 'FORBIDDEN_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to run matching on another hospital\'s request' } });
      return;
    }
    if (error?.message === 'INVALID_REQUEST_STATE_FOR_MATCHING') {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Fulfilled, cancelled, or expired requests cannot be matched' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'MATCHING_FAILED', message: error?.message || 'Failed to run matching engine' },
    });
  }
};

export const getMatchesForRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const requestId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const hospitalId = req.user.hospitalId || '';
    const isAdmin = req.user.role === 'ADMIN';

    const matches = await MatchingService.getMatchesForRequest(requestId, hospitalId, isAdmin);

    res.status(200).json({
      success: true,
      data: {
        requestId,
        matches,
      },
    });
  } catch (error: any) {
    if (error?.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Blood request not found' } });
      return;
    }
    if (error?.message === 'FORBIDDEN_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not authorized to view matches for another hospital\'s request' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'GET_MATCHES_FAILED', message: error?.message || 'Failed to fetch matches' },
    });
  }
};

export const acceptMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const matchId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const isAdmin = req.user.role === 'ADMIN';

    const updatedMatch = await MatchingService.acceptMatch(matchId, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      data: updatedMatch,
      message: 'Match request accepted successfully',
    });
  } catch (error: any) {
    if (error?.message === 'MATCH_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'MATCH_NOT_FOUND', message: 'Match record not found' } });
      return;
    }
    if (error?.message === 'FORBIDDEN_MATCH_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot accept a match request that belongs to another donor' } });
      return;
    }
    if (error?.message?.startsWith('INVALID_MATCH_STATUS')) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Match is no longer pending and cannot be accepted' } });
      return;
    }
    if (error?.message === 'REQUEST_INACTIVE') {
      res.status(400).json({ success: false, error: { code: 'REQUEST_INACTIVE', message: 'The associated blood request is no longer active' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'ACCEPT_MATCH_FAILED', message: error?.message || 'Failed to accept match' },
    });
  }
};

export const rejectMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const matchId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const isAdmin = req.user.role === 'ADMIN';

    const updatedMatch = await MatchingService.rejectMatch(matchId, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      data: updatedMatch,
      message: 'Match request declined successfully',
    });
  } catch (error: any) {
    if (error?.message === 'MATCH_NOT_FOUND') {
      res.status(404).json({ success: false, error: { code: 'MATCH_NOT_FOUND', message: 'Match record not found' } });
      return;
    }
    if (error?.message === 'FORBIDDEN_MATCH_OWNERSHIP') {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot decline a match request that belongs to another donor' } });
      return;
    }
    if (error?.message?.startsWith('INVALID_MATCH_STATUS')) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Match is no longer pending' } });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'REJECT_MATCH_FAILED', message: error?.message || 'Failed to decline match' },
    });
  }
};
