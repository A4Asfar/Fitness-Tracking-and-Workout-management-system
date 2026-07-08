import { Redirect } from 'expo-router';

/** Legacy route — redirects to the Trainers tab */
export default function TrainerRedirect() {
  return <Redirect href="/(tabs)/trainers" />;
}
