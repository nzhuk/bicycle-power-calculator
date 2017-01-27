export interface IInput {
  rollingResistanceCoefficient: number;
  drag: number;
  frontChainRingTeethCount: number;
  casetteChainRingTeethCount: number;
  mechanicalLosses: number;
  wheelDiameterInInches: number;
  desiredConstantSpeedInMilesPerHour: number;
  riderWeightInKg: number;
  bikeWeightInKg: number;
  gradeInPercent: number;
  crankLengthInInches: number;
}

export interface IOutput {
  requiredAirPowerInHP: number; // Power needed to overcome air resistance
  requiredAirPowerInPercentage: number;

  requiredRollPowerInHP: number; // Power to overcome rolling resistance in tires
  requiredRollPowerInPercentage: number;

  requiredHillPowerInHP: number; // Power needed for elevation change
  requiredHillPowerInPercentage: number;

  requiredTotalInputInHP: number;
  requiredTotalInputInWatts: number;

  averagePedalForceInLbs: number;
  pedalSpeedInRPM: number;

  powerLostToMechanicalLossesInHP: number;
  powerLostToMechanicalLossesInPercentage: number;
  averageTractionForceInLbs: number;
  tireSpeedInRPM: number;
  caloriesBurnedPerMile: number;
}

export function calculate(input: IInput): IOutput {
  const output: any = {};

  CalculateForce(input, output);
  CalculatePow(input, output);
  CalculateRPM(input, output);
  CalculateCal(input, output);

  output.powerLostToMechanicalLossesInPercentage = 100 * output.powerLostToMechanicalLossesInHP / output.requiredTotalInputInHP;
  output.requiredAirPowerInPercentage = 100 * output.requiredAirPowerInHP / output.requiredTotalInputInHP;
  output.requiredRollPowerInPercentage = 100 * output.requiredRollPowerInHP / output.requiredTotalInputInHP;
  output.requiredHillPowerInPercentage = 100 * output.requiredHillPowerInHP / output.requiredTotalInputInHP;
  output.requiredTotalInputInWatts = output.requiredTotalInputInHP * 746;

  return output as IOutput;
}

function CalculateForce(input: IInput, output: IOutput): void {
  const Eff = 1 - input.mechanicalLosses / 100;
  const Wheel = input.wheelDiameterInInches / 2;
  const V = input.desiredConstantSpeedInMilesPerHour * 5280 / 3600;
  const TotalWeightInLbs = (input.riderWeightInKg + input.bikeWeightInKg) * 2.20462;

  const ang = Math.atan(input.gradeInPercent / 100);
  const GearT = (1.0 * input.casetteChainRingTeethCount / input.frontChainRingTeethCount) * input.crankLengthInInches / Wheel;
  const Frr = input.rollingResistanceCoefficient * TotalWeightInLbs;
  const Fdr = input.drag * V * V;

  output.requiredAirPowerInHP = (Fdr * V) / 550;
  output.requiredRollPowerInHP = (Frr * V) / 550;
  output.requiredHillPowerInHP = (TotalWeightInLbs * Math.sin(ang) * V) / 550;
  const ExtFor = Frr + Fdr;
  const ForceT = (TotalWeightInLbs * Math.sin(ang) + ExtFor) / (GearT * Eff);
  output.averagePedalForceInLbs = ForceT;
}

function CalculatePow(input: IInput, output: IOutput): void {
  const Eff = 1 - input.mechanicalLosses / 100;
  const Wheel = input.wheelDiameterInInches / 2;
  const V = input.desiredConstantSpeedInMilesPerHour * 5280 / 3600;
  const GearT = (1.0 * input.casetteChainRingTeethCount / input.frontChainRingTeethCount) * input.crankLengthInInches / Wheel;
  const ForceT = output.averagePedalForceInLbs;
  const PowerT = (GearT * V * ForceT) / 550;

  output.averageTractionForceInLbs = ForceT * GearT * Eff;
  output.powerLostToMechanicalLossesInHP = PowerT - output.requiredAirPowerInHP - output.requiredRollPowerInHP - output.requiredHillPowerInHP;
  output.requiredTotalInputInHP = PowerT;
}

function CalculateRPM(input: IInput, output: IOutput): void {
  const Eff = 1 - input.mechanicalLosses / 100;
  const Wheel = input.wheelDiameterInInches / 2;
  const ForceT = output.averagePedalForceInLbs;
  const PowerT = output.requiredTotalInputInHP;
  const V = input.desiredConstantSpeedInMilesPerHour * 5280 / 3600;
  const RPMT = (PowerT * 550 * 60) / (ForceT * .5625 * Math.PI * 2);
  output.tireSpeedInRPM = (V * 60 * 12) / (Wheel * Math.PI * 2);
  output.pedalSpeedInRPM = RPMT;
}

function CalculateCal(input: IInput, output: IOutput): void {
  const PowerT = output.requiredTotalInputInHP;
  const V = input.desiredConstantSpeedInMilesPerHour / 3600;
  const CalT = (PowerT * 550) / (V * 3089);
  output.caloriesBurnedPerMile = CalT;
}
