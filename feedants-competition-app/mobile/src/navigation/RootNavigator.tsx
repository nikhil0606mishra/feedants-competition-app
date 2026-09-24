import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompetitionDetailsScreen from '../screens/CompetitionDetailsScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import { config } from '../config';

export type RootStackParamList = {
  CompetitionDetails: { competitionId: string };
  Submission: { competitionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      {/* Headers hidden: each screen renders the design's own <Header />. */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CompetitionDetails"
          component={CompetitionDetailsScreen}
          initialParams={{ competitionId: config.demoCompetitionId }}
        />
        <Stack.Screen name="Submission" component={SubmissionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
