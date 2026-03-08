import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native";
import ProgressTracker from '../../components/ProgressTracker';
import ProgressTrackerStyles from '../../styles/componentstyles/ProgressTrackerStyles';
import VisaApplicationViewStyle from '../../styles/adminstyles/VisaApplicationViewStyle';

export default function VisaApplicationView() {
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
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <View style={VisaApplicationViewStyle.container}>
                        <Text style={VisaApplicationViewStyle.title}>Visa Application</Text>

                        <View style={VisaApplicationViewStyle.card}>
                            <Text style={VisaApplicationViewStyle.sectionTitle}>Documents</Text>

                            <View style={VisaApplicationViewStyle.uploadRow}>
                                <Text style={VisaApplicationViewStyle.listItem}>2x2 Photo</Text>
                                <TouchableOpacity style={VisaApplicationViewStyle.uploadButton}>
                                    <Text style={VisaApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={VisaApplicationViewStyle.uploadRow}>
                                <Text style={VisaApplicationViewStyle.listItem}>Applicaton Form</Text>
                                <TouchableOpacity style={VisaApplicationViewStyle.uploadButton}>
                                    <Text style={VisaApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={VisaApplicationViewStyle.uploadRow}>
                                <Text style={VisaApplicationViewStyle.listItem}>PSA Birth Certificate</Text>
                                <TouchableOpacity style={VisaApplicationViewStyle.uploadButton}>
                                    <Text style={VisaApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={VisaApplicationViewStyle.uploadRow}>
                                <Text style={VisaApplicationViewStyle.listItem}>Valid Government Issued ID</Text>
                                <TouchableOpacity style={VisaApplicationViewStyle.uploadButton}>
                                    <Text style={VisaApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={VisaApplicationViewStyle.card}>
                            <Text style={ProgressTrackerStyles.header}>Progress Tracker</Text>

                            <ProgressTracker steps={visaSteps} currentStep={2} />

                        </View>

                        <TouchableOpacity
                            style={VisaApplicationViewStyle.backButton}
                            onPress={() => {
                                cs.navigate("visaapplications")
                            }}
                        >
                            <Text style={VisaApplicationViewStyle.backText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}