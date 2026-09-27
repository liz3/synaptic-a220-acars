import AcarsService from "./common/AcarsService.mjs";
import { tryLoadOans } from "./common/utils.mjs";
import Cpdlc from "./pages/Cpdlc";
import Dlk from "./pages/Dlk";
import EicasTab from "./pages/EicasTab";

AcarsService.registerEventHandlers();
tryLoadOans();

window.AcarsComponents = {
  Cpdlc,
  Dlk,
  EicasFunc: EicasTab
}