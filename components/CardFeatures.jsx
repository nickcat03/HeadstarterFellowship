import { Typography } from "@mui/material";
import { Card, CardContent } from "@mui/material";


export default function CardFeatures(props) {
  return (
    <Card className="bg-primary hover:bg-gray-200 transition-colors ease-out border border-secondary">
      <CardContent className="text-gray-200 hover:text-black">
        <div className="flex justify-between items-center gap-5">
          <Typography
            variant="h6"
            gutterBottom
            className="text-lg font-bold text-secondary"
          >
            {props.text}
          </Typography>
          <Typography className="text-secondary">{props.icon}</Typography>
        </div>

        <Typography variant="h6" className="" gutterBottom>
          {props.desc}
        </Typography>
      </CardContent>
    </Card>
  );
}
