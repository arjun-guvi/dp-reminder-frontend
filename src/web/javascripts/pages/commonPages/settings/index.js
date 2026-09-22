// Settings Page
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

const SettingsPage = () => {
  return (
    <Box className="settings-page">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your preferences
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email notifications"
          />
          <br />
          <FormControlLabel
            control={<Switch />}
            label="Push notifications"
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Privacy
          </Typography>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Show profile to other users"
          />
          <br />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Allow analytics"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
