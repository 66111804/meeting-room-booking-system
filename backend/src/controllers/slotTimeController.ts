// src/controllers/slotTimeController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addMinutes, parse, format } from 'date-fns';

const prisma = new PrismaClient();


interface GetTimeSlotsQuery {
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
}

export const generateDefaultSlots = async (req: Request, res: Response) => {
  try {
    // clear existing slots
    await prisma.slotTime.deleteMany({});

    const startTime = parse('08:00', 'HH:mm', new Date());
    const endTime = parse('18:00', 'HH:mm', new Date());
    const interval = 30; // minutes
    const slots = [];

    let currentTime = startTime;

    while (currentTime < endTime) {
      const timeSlot = {
        startTime: currentTime,
        endTime: addMinutes(currentTime, interval),
        isActive: true
      };

      slots.push(timeSlot);
      currentTime = addMinutes(currentTime, interval);
    }

    // save database
    const createdSlots = await prisma.slotTime.createMany({
      data: slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive
      }))
    });

    res.status(201).json({
      message: 'Time slots generated successfully',
      count: createdSlots.count,
      slots: slots.map(slot => ({
        startTime: format(slot.startTime, 'HH:mm'),
        endTime: format(slot.endTime, 'HH:mm')
      }))
    });

  } catch (error) {
    console.error('Error generating time slots:', error);
    res.status(500).json({
      error: 'Failed to generate time slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
