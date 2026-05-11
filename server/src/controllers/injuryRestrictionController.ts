import { Request, Response } from 'express';
import { db } from '../services/db';

export const getInjuryRestrictions = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT ir.*, GROUP_CONCAT(e.name) as avoidExercises
      FROM InjuryRestriction ir
      LEFT JOIN InjuryExcludedExercise iee ON ir.id = iee.restrictionId
      LEFT JOIN Exercise e ON iee.exerciseId = e.id
      GROUP BY ir.id
    `);
    
    const data = (rows as any[]).map(row => ({
      ...row,
      avoidExercises: row.avoidExercises ? row.avoidExercises.split(',') : []
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching injury restrictions:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching injury restrictions' });
  }
};

export const getInjuryRestrictionByType = async (req: Request, res: Response) => {
  const { type } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT ir.*, GROUP_CONCAT(e.name) as avoidExercises
      FROM InjuryRestriction ir
      LEFT JOIN InjuryExcludedExercise iee ON ir.id = iee.restrictionId
      LEFT JOIN Exercise e ON iee.exerciseId = e.id
      WHERE ir.injuryType = ?
      GROUP BY ir.id
    `, [type]);
    
    const row = (rows as any[])[0];
    
    if (!row) {
      return res.status(404).json({ success: false, message: 'Restriction not found' });
    }

    res.json({ 
      success: true, 
      data: {
        ...row,
        avoidExercises: row.avoidExercises ? row.avoidExercises.split(',') : []
      } 
    });
  } catch (error) {
    console.error('Error fetching injury restriction:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching injury restriction' });
  }
};
