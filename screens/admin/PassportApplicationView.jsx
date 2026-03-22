import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native";
import PassportApplicationViewStyle from '../../styles/adminstyles/PassportApplicationViewStyle';
import ProgressTracker from '../../components/ProgressTracker';
import ProgressTrackerStyles from '../../styles/componentstyles/ProgressTrackerStyles';

export default function PassportApplicationView() {
    const cs = useNavigation()
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
            description: "Your passport is being processed",
        },
        {
            title: "Passport Rejected",
            description: "Your documents are being delivered back",
        },
        {
            title: "Passport Completed",
            description: "Passport released successfully",
        },
    ];

    return (
        <View>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <View style={PassportApplicationViewStyle.container}>
                        <Text style={PassportApplicationViewStyle.title}>Visa Application</Text>

                        <View style={PassportApplicationViewStyle.card}>
                            <Text style={PassportApplicationViewStyle.sectionTitle}>Documents</Text>

                            <View style={PassportApplicationViewStyle.uploadRow}>
                                <Text style={PassportApplicationViewStyle.listItem}>Passport</Text>
                                <TouchableOpacity style={PassportApplicationViewStyle.uploadButton}>
                                    <Text style={PassportApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={PassportApplicationViewStyle.uploadRow}>
                                <Text style={PassportApplicationViewStyle.listItem}>Visa Applicaton Form</Text>
                                <TouchableOpacity style={PassportApplicationViewStyle.uploadButton}>
                                    <Text style={PassportApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={PassportApplicationViewStyle.uploadRow}>
                                <Text style={PassportApplicationViewStyle.listItem}>PSA Birth Certificate</Text>
                                <TouchableOpacity style={PassportApplicationViewStyle.uploadButton}>
                                    <Text style={PassportApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={PassportApplicationViewStyle.uploadRow}>
                                <Text style={PassportApplicationViewStyle.listItem}>Valid Government Issued ID</Text>
                                <TouchableOpacity style={PassportApplicationViewStyle.uploadButton}>
                                    <Text style={PassportApplicationViewStyle.uploadButtonText}>View</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={PassportApplicationViewStyle.card}>
                            <Text style={ProgressTrackerStyles.header}>Progress Tracker</Text>

                            <ProgressTracker steps={passportSteps} currentStep={1} />

                        </View>

                        <TouchableOpacity
                            style={PassportApplicationViewStyle.backButton}
                            onPress={() => {
                                cs.navigate("passportapplications")
                            }}
                        >
                            <Text style={PassportApplicationViewStyle.backText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}