import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ProgressTracker from "../../components/ProgressTracker";
import { useNavigation } from "@react-navigation/native";
import ProgressTrackerStyles from "../../styles/componentstyles/ProgressTrackerStyles";

export default function VisaProgress() {
    const cs = useNavigation()

    const visaSteps = [
        {
            title: "Documents Submitted",
            description: "Your documents are being verified",
        },
        {
            title: "Documents Approved",
            description: "You may now deliver the documents",
        },
        {
            title: "Visa Processing",
            description: "Your visa is currently being processed",
        },
        {
            title: "Visa Rejected",
            description: "Your documents are being delivered back",
        },
        {
            title: "Visa Completed",
            description: "Visa process completed successfully",
        },
    ];

    return (
        <View>
            <View style={ProgressTrackerStyles.container}>
                <Text style={ProgressTrackerStyles.header}>Your Progress Tracker</Text>

                <ProgressTracker steps={visaSteps} currentStep={2} />

                <TouchableOpacity
                    style={ProgressTrackerStyles.button}
                    onPress={() => {
                        cs.navigate('visaguidance')
                    }}>
                    <Text style={ProgressTrackerStyles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}