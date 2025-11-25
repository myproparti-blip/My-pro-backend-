import Agent from "../models/agentModel.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const ADMIN_PHONE = process.env.ADMIN_PHONE;

const isMasterAdmin = (req) => req.user?.phoneNumber === ADMIN_PHONE;

export const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.FETCH_SUCCESS,
    data: agents,
  });
});

export const registerAgent = asyncHandler(async (req, res) => {
  const {
    isPropertyDealer,
    agentName,
    firmName,
    operatingCity,
    operatingAreaChips = [],
    operatingSince = "",
    teamMembers = 0,
    dealsIn = [],
    dealsInOther = [],
    aboutAgent = "",
  } = req.body || {};

  if (!agentName?.trim() || !operatingCity?.trim() || !dealsIn.length) {
    throw new ApiError(MESSAGES.AGENT.REQUIRED_FIELDS, 400);
  }

  const newAgent = await Agent.create({
    user: req.user?.id,
    isPropertyDealer:
      isPropertyDealer === true || isPropertyDealer === "true" ? "yes" : "no",
    agentName: agentName.trim(),
    firmName: firmName?.trim() || "",
    operatingCity: operatingCity.trim(),
    operatingAreaChips,
    operatingSince,
    teamMembers: String(teamMembers),
    dealsIn,
    dealsInOther: Array.isArray(dealsInOther)
      ? dealsInOther.join(", ")
      : dealsInOther,
    aboutAgent: aboutAgent?.trim() || "",
  });

  res.status(201).json({
    success: true,
    message: MESSAGES.AGENT.ADD_SUCCESS,
    data: newAgent,
  });
});

export const getAgentById = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.FETCH_SUCCESS,
    data: agent,
  });
});

export const updateAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  if (!isMasterAdmin(req) && agent.user?.toString() !== req.user?.id) {
    throw new ApiError(MESSAGES.AGENT.NOT_AUTHORIZED, 403);
  }

  const fields = [
    "isPropertyDealer",
    "agentName",
    "firmName",
    "operatingCity",
    "operatingAreaChips",
    "operatingSince",
    "teamMembers",
    "dealsIn",
    "dealsInOther",
    "aboutAgent",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      agent[field] =
        typeof req.body[field] === "string"
          ? req.body[field].trim()
          : req.body[field];
    }
  });

  const updatedAgent = await agent.save();
  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.UPDATE_SUCCESS,
    data: updatedAgent,
  });
});

export const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  if (!isMasterAdmin(req) && agent.user?.toString() !== req.user?.id) {
    throw new ApiError(MESSAGES.AGENT.NOT_AUTHORIZED, 403);
  }

  await agent.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.DELETE_SUCCESS,
  });
});
