import { ReactionSim } from "./ReactionSim";
import { ChessSim } from "./ChessSim";
import { BirthdaySim } from "./BirthdaySim";
import { AlarmSim } from "./AlarmSim";
import { GateSim } from "./GateSim";

export function SimulationFor({ slug }: { slug: string }) {
  switch (slug) {
    case "f1-reaction-time":
      return <ReactionSim />;
    case "blitz-chess-timer":
      return <ChessSim />;
    case "birthday-countdown":
      return <BirthdaySim />;
    case "motion-desk-alarm":
      return <AlarmSim />;
    case "ultrasonic-servo-gate":
      return <GateSim />;
    default:
      return null;
  }
}
