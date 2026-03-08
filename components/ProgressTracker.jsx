import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import ProgressTrackerStyles from '../styles/componentstyles/ProgressTrackerStyles';

export default function ProgressTracker({ steps, currentStep }) {
    return (
        <View style={ProgressTrackerStyles.container}>
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                    <View key={index} style={ProgressTrackerStyles.stepRow}>
                        <View style={ProgressTrackerStyles.indicatorColumn}>
                            <View
                                style={[
                                    ProgressTrackerStyles.circle,
                                    isCompleted && ProgressTrackerStyles.completedCircle,
                                    isActive && ProgressTrackerStyles.activeCircle,
                                ]}
                            >
                                {isCompleted && (
                                    <Ionicons name="checkmark" size={14} color="#fff" />
                                )}
                            </View>

                            {index !== steps.length - 1 && (
                                <View
                                    style={[
                                        ProgressTrackerStyles.line,
                                        isCompleted && ProgressTrackerStyles.completedLine,
                                    ]}
                                />
                            )}
                        </View>

                        <View
                            style={[
                                ProgressTrackerStyles.stepCard,
                                isActive && ProgressTrackerStyles.activeCard,
                            ]}
                        >
                            <Text style={ProgressTrackerStyles.stepTitle}>{step.title}</Text>
                            <Text style={ProgressTrackerStyles.stepDescription}>
                                {step.description}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}