import { Box, Button, Alert } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";

export default function Error() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="70vh"
      gap="1em"
    >
      <Alert severity="warning">
        Oops! something went wrong. It seems your not logged in. Please login
        and try again later.
      </Alert>
      <Link href="/sign-in" passHref legacyBehavior>
        <Button variant="contained">Sign in</Button>
      </Link>
    </Box>
  );
}
