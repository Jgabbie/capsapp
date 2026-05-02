import VisaServiceModel from "../models/visaService.js";



export const getAllServices = async (_req, res) => {
  try {
    const services = await VisaServiceModel.find({}).sort({ createdAt: -1 });

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

export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await VisaServiceModel.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

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