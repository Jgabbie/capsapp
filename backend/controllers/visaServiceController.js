import VisaServiceModel from "../models/visaService.js";

const defaultServices = [
  {
    visaName: "Japan Visa",
    visaPrice: 3500,
    visaDescription: "Tourist visa processing assistance for Japan.",
    visaRequirements: [
      "Valid passport (at least 6 months validity)",
      "Completed visa application form",
      "Recent passport-size photo",
      "Proof of financial capacity",
    ],
    // 🔥 SYNCED: Added Web fields
    visaAdditionalRequirements: [],
    visaProcessSteps: [
      "Choose your preferred visa service.",
      "Submit required documents.",
      "Agency verification and embassy submission.",
      "Wait for processing and release updates.",
    ],
    visaReminders: [
      "Processing times may vary depending on the embassy.",
      "Ensure all documents are clear and readable."
    ],
    visaType: "Tourist",
  },
  {
    visaName: "Korea Visa",
    visaPrice: 3200,
    visaDescription: "Tourist visa processing assistance for South Korea.",
    visaRequirements: [
      "Valid passport (at least 6 months validity)",
      "Completed visa application form",
      "Recent passport-size photo",
      "Bank certificate and statement",
    ],
    visaAdditionalRequirements: [],
    visaProcessSteps: [
      "Select service and submit requirements.",
      "Document checking and profile review.",
      "Submission to the visa center.",
      "Receive status update and release schedule.",
    ],
    visaReminders: [
      "Korean embassy strictly checks bank statements.",
      "Do not book flights until visa is approved."
    ],
    visaType: "Tourist",
  },
];

const ensureSeedServices = async () => {
  const count = await VisaServiceModel.countDocuments();
  if (count === 0) {
    await VisaServiceModel.insertMany(defaultServices);
  }
};

export const getAllServices = async (_req, res) => {
  try {
    await ensureSeedServices();
    const services = await VisaServiceModel.find({}).sort({ createdAt: -1 });
    
    // 🔥 SYNCED: Map the response to exactly match Web's payload
    const servicesPayload = services.map(service => ({
        visaItem: service._id, // Web uses visaItem for the ID
        visaName: service.visaName,
        visaDescription: service.visaDescription,
        visaPrice: service.visaPrice,
        visaRequirements: service.visaRequirements,
        visaAdditionalRequirements: service.visaAdditionalRequirements || [],
        visaProcessSteps: service.visaProcessSteps,
        visaReminders: service.visaReminders || [],
        visaType: service.visaType
    }));

    return res.status(200).json(servicesPayload);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving services", error: error.message });
  }
};

export const createService = async (req, res) => {
  // 🔥 SYNCED: Added new fields
  const { visaName, visaDescription, visaPrice, visaRequirements, visaAdditionalRequirements, visaProcessSteps, visaReminders, visaType } = req.body;

  try {
    const newService = await VisaServiceModel.create({
      visaName,
      visaDescription,
      visaPrice,
      visaRequirements,
      visaAdditionalRequirements: Array.isArray(visaAdditionalRequirements) ? visaAdditionalRequirements : [],
      visaProcessSteps,
      visaReminders,
      visaType,
    });

    return res.status(201).json(newService);
  } catch (error) {
    return res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { visaName, visaDescription, visaPrice, visaRequirements, visaAdditionalRequirements, visaProcessSteps, visaReminders, visaType } = req.body;

  try {
    const updatedService = await VisaServiceModel.findByIdAndUpdate(
      id,
      { visaName, visaDescription, visaPrice, visaRequirements, visaAdditionalRequirements, visaProcessSteps, visaReminders, visaType },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    return res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedService = await VisaServiceModel.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};

export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await VisaServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🔥 SYNCED: Exact payload structure as Web
    const servicePayload = {
        visaItem: service._id,
        visaName: service.visaName,
        visaDescription: service.visaDescription,
        visaPrice: service.visaPrice,
        visaRequirements: service.visaRequirements,
        visaAdditionalRequirements: service.visaAdditionalRequirements || [],
        visaProcessSteps: service.visaProcessSteps,
        visaReminders: service.visaReminders || [],
        visaType: service.visaType
    }

    return res.status(200).json(servicePayload);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving service", error: error.message });
  }
};