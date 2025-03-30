// src/controllers/administrator/meetingRoomController.ts
// noinspection DuplicatedCode

import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { RoomFeaturesResponse } from "../../shared/RoomFeaturesResponse";
import { uploadDir } from "../../shared/uploadFile";
const prisma = new PrismaClient();

// ------------------- Get all meeting rooms -------------------
export const getMeetingRooms = async (req: any, res: any) => {
  try {
    let { page, limit, search } = req.query;
    const { id } = req.params;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    let where = {};
    if (search) {
      where = {
        OR: [
            { name: { startsWith: search },},
            { description: { startsWith: search },},
        ]
      };

    }
    if (id) {
      where = {
        id: parseInt(id),
      };
    }


    const meetingRooms = await prisma.meetingRoom.findMany({
      where,
      include:{
        roomHasFeatures:{
          include:{
            feature: true
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const total = await prisma.meetingRoom.count({ where });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({ meetingRooms, total, totalPages, current: page });
  } catch (error:any) {
    console.log(error.message);

    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Get meeting room by id -------------------
export const getMeetingRoom = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing meeting room id" });
    }
    const meetingRoom = await prisma.meetingRoom.findUnique({
      where: {
        id: parseInt(id),
      },
      include:{
        roomHasFeatures:{
          include:{
            feature: true
          },
        }
      },
    });

    return res.status(200).json(meetingRoom);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Create meeting room -------------------
export const createMeetingRoom = async (req: any, res: any) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array() });
    }

    const { name, description, features , capacity, status} = req.body


    /*
      example for data:
      {
        "name": "Meeting Room 1",
        "description": "This is a meeting room",
        "features": [1, 2, 3] // feature ids
      }
     */

    if (!name || !description || !features) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // image upload
    const image = req.file;
    let fileName: string | undefined ='';
    if(image){
      fileName = image.filename;
    }

    const meetingRoom = await prisma.meetingRoom.create({
      data: {
        name,
        description,
        imageUrl: fileName || '',
        capacity: capacity ? parseInt(capacity) : 0,
        status: status || 'active',
        roomHasFeatures: {
          create: features.map((featureId: number) => ({
            featureId: parseInt(featureId.toString(), 10),
          })),
        },
      },
    });

    return res.status(201).json(meetingRoom);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Update meeting room -------------------
export const updateMeetingRoom = async (req: any, res: any) => {
  try {
    body("name").notEmpty().withMessage("Name is required");
    body("description").notEmpty().withMessage("Description is required");
    body("features").isArray({ min: 1 }).withMessage("Features is required");
    body("capacity").isNumeric().optional();
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array() });
    }

    const { id } = req.params;
    const { name, description, features, capacity, status } = req.body;

    /*
      example for data:
      {
        "name": "Meeting Room 1",
        "description": "This is a meeting room",
        "features": [1, 2, 3] // feature ids
      }
     */

    if (!name || !description || !features) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const meetingRoom = await prisma.meetingRoom.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    if (!meetingRoom) {
      return res.status(404).json({ message: "Meeting room not found" });
    }

    const image = req.file;
    let fileName: string | null = meetingRoom.imageUrl;
    if(image){
      fileName = image.filename;

      // remove old image
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(`${uploadDir}/${meetingRoom.imageUrl}`);

        if(fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }catch (error:any) {
        console.log(error);
      }

    }

    const updatedMeetingRoom = await prisma.meetingRoom.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        description: description,
        imageUrl: fileName || '',
        capacity: capacity ? parseInt(capacity) : 0,
        status: status || 'active',
        roomHasFeatures: {
          deleteMany: {},
          create: features.map((featureId: number) => ({
            featureId: parseInt(featureId.toString(), 10),
          })),
        },
      },
    });

    return res.status(200).json(updatedMeetingRoom);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Delete meeting room -------------------
export const deleteMeetingRoom = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing meeting room id" });
    }

    const meetingRoom = await prisma.meetingRoom.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    if(!meetingRoom){
      return res.status(404).json({ message: "Meeting room not found" });
    }

    // remove image
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(`${uploadDir}/${meetingRoom.imageUrl}`);

      if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }catch (error:any) {
      console.log(error);
    }

    // delete meeting room and related features
    await prisma.$transaction([
      // delete meeting room features
      prisma.meetingRoomFeatures.deleteMany({
        where: {
          meetingRoomId: parseInt(id),
        },
      }),
      prisma.meetingRoomBooking.deleteMany({
        where: {
          meetingRoomId: parseInt(id),
        },
      }),
      // delete meeting room
      prisma.meetingRoom.delete({
        where: {
          id: parseInt(id),
        },
      }),
    ]);

    return res.status(204).json();
  } catch (error:any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Check room is-exist by name -------------------
export const isValidateMeetingRoom = async (req: any, res: any) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Missing meeting room name" });
    }
    const meetingRoom = await prisma.meetingRoom.findFirst({
      where: {
        name: name,
      },
    });
    return res.status(200).json({ valid: !!meetingRoom });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Check room is-exist by name with id -------------------
export const isValidateMeetingRoomWithId = async (req: any, res: any) => {
  try {
    const { name } = req.query;
    const { id } = req.params;

    if (!id || !name) {
      return res.status(400).json({ message: "Missing meeting room id or name" });
    }
    const meetingRoom = await prisma.meetingRoom.findFirst({
      where: {
        name: name,
        NOT: {
            id: parseInt(id),
        }
      },
    });
    return res.status(200).json({ valid: !!meetingRoom });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Room features -------------------
export const getRoomFeatures = async (req: any, res: any) => {
  try {

    let { page, limit, search } = req.query;
    const { id } = req.params; // meeting room id
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    search = search || '';

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search} },
        ]
      };
    }

    const features = await prisma.features.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const roomFeatures = await prisma.meetingRoomFeatures.findMany({
      where: {
        meetingRoomId: parseInt(id),
      },
      select: {
        featureId: true,
      }
    });

    const selectedFeatureIds = new Set(roomFeatures.map((rf) => rf.featureId));

    const enrichedFeatures = features.map((feature) => ({
      ...feature,
      createdAt: feature.createdAt.toISOString(), // Convert Date to string
      updatedAt: feature.updatedAt.toISOString(), // Convert Date to string
      selected: selectedFeatureIds.has(feature.id), // Add selected property
    }));

    const total = await prisma.features.count({ where });
    const totalPages = Math.ceil(total / limit);

    const response: RoomFeaturesResponse = {
      features: enrichedFeatures,
      total,
      totalPages,
      current: page,
    };

    return res.status(200).json(response);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Get all features -------------------
export const getFeatures = async (req: any, res: any) => {
  try {

    let { page, limit, search } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    search = search || '';

    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { startsWith: search} },
        ]
      };
    }

    const features = await prisma.features.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const total = await prisma.features.count({ where });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({ features, total, totalPages, current: page });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Get feature by id -------------------
export const getFeature = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing feature id" });
    }
    const feature = await prisma.features.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(200).json(feature);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Create feature -------------------
export const createFeature = async (req: any, res: any) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array() });
    }

    const { name } = req.body
    /*
      example for data:
      {
        "name": "Projector"
      }
     */

    if (!name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feature = await prisma.features.create({
      data: {
        name,
      },
    });

    return res.status(201).json(feature);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Update feature -------------------
export const updateFeature = async (req: any, res: any) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ message: result.array() });
    }

    const { id } = req.params;
    const { name } = req.body
    /*
      example for data:
      {
        "name": "Projector"
      }
     */

    if (!name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const feature = await prisma.features.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
      },
    });

    return res.status(200).json(feature);
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Delete feature -------------------
export const deleteFeature = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing feature id" });
    }

    // check if feature is used in meeting room
    const meetingRoom = await prisma.meetingRoom.findFirst({
      where: {
        roomHasFeatures: {
          some: {
            id: parseInt(id),
          },
        },
      },
    });

    if (meetingRoom) {
      return res.status(400).json({ message: "Feature is used in meeting room" });
    }

    await prisma.features.delete({
      where: {
        id: parseInt(id),
      },
    });

    return res.status(204).json();
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Check feature is-exist by name -------------------
export const isValidateFeature = async (req: any, res: any) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Missing feature name" });
    }

    const feature = await prisma.features.findFirst({
      where: {
        name: name.trimEnd(),
      },
    });
    return res.status(200).json({ valid: !feature });

  } catch (error:any) {
    console.log(error);

    return res.status(500).json({ message: error.message });
  }
};

// ------------------- Check feature is-exist by name with id -------------------
export const isValidateFeatureWithId = async (req: any, res: any) => {
  try {
    const { id, name } = req.query;
    if (!id || !name) {
      return res.status(400).json({ message: "Missing feature id or name" });
    }

    const feature = await prisma.features.findFirst({
      where: {
        id: parseInt(id),
        name: name,
      },
    });
    return res.status(200).json({ valid: !feature });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
};

