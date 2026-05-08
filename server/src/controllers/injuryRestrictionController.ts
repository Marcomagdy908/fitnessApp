import { Request, Response } from 'express';
import { db } from '../services/db';

export const getInjuryRestrictions = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM InjuryRestriction');
    
    // Parse avoidExercises from JSON string back to array
    const data = (rows as any[]).map(row => ({
      ...row,
      avoidExercises: JSON.parse(row.avoidExercises)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching injury restrictions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getInjuryRestrictionByType = async (req: Request, res: Response) => {
  const { type } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM InjuryRestriction WHERE injuryType = ?', [type]);
    const row = (rows as any[])[0];
    
    if (!row) {
      return res.status(404).json({ success: false, message: 'Restriction not found' });
    }

    res.json({ 
      success: true, 
      data: {
        ...row,
        avoidExercises: JSON.parse(row.avoidExercises)
      } 
    });
  } catch (error) {
    console.error('Error fetching injury restriction:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
