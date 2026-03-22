import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import ProgressTracker from "../../components/ProgressTracker";
import { useNavigation } from "@react-navigation/native";
import ProgressTrackerStyles from "../../styles/componentstyles/ProgressTrackerStyles";
import { api, withUserHeader } from "../../utils/api";
import { useUser } from "../../context/UserContext";

export default function PassportProgress() {
  const cs = useNavigation();
  const { user } = useUser();
  const [status, setStatus] = useState("Pending");

  const passportSteps = [
    {
      title: "Documents Submitted",
      description: "Your documents are being verified",
    },
    {
      title: "Documents Approved",
      description: "You may now deliver the documents",
    },
    {
      title: "Passport Processing",
      description: "Your passport is currently being processed",
    },
    {
      title: "Passport Rejected",
      description: "Your documents are being delivered back",
    },
    {
      title: "Passport Completed",
      description: "Passport process completed successfully",
    },
  ];

  useEffect(() => {
    let mounted = true;

    const loadLatestApplication = async () => {
      if (!user?._id) return;
      try {
        const { data } = await api.get("/passport/applications", withUserHeader(user._id));
        if (mounted && Array.isArray(data) && data.length) {
          setStatus(data[0].status || "Pending");
        }
      } catch (_error) {
        if (mounted) {
          Alert.alert("Unable to load status", "Showing default progress while status sync is unavailable.");
        }
      }
    };

    loadLatestApplication();

    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const currentStep = useMemo(() => {
    if (status === "Approved") return 4;
    if (status === "Rejected") return 3;
    if (status === "Processing") return 2;
    return 1;
  }, [status]);

  return (
    <View>
      <View style={ProgressTrackerStyles.container}>
        <Text style={ProgressTrackerStyles.header}>Your Progress Tracker</Text>

        <ProgressTracker steps={passportSteps} currentStep={currentStep} />

        <TouchableOpacity
          style={ProgressTrackerStyles.button}
          onPress={() => {
            cs.navigate("passportguidance");
          }}
        >
          <Text style={ProgressTrackerStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
