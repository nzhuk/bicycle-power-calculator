
export interface IInput {
  rollingResistanceCoefficient: number; // (lbf/lbf), 0.004 (27x1.125" 95 psi Road Clinchers Racing Tires)
  drag: number; // Air Resistance Coefficient (lbf*s^2/ft^2), Straight Arms (Cd*A =.004),  Full Crouch (Cd*A =.0032),  Hill Descent (Cd*A =.0027),  No Rider (Cd*A=.0012), Zero Air Drag (Cd*A=0)
  frontChainRingTeethCount: number;
  casetteChainRingTeethCount: number;
  mechanicalLosses: number; // (3-5% is typical)
  wheelDiameterInInches: number;
  desiredConstantSpeedInMilesPerHour: number;
  riderWeightInLbs: number;
  bikeWeightInLbs: number;
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

export class BikeCalculator {
  public static calculate(input: IInput): IOutput {
    const output: any = {};
    this.CalculateForce(input, output);
    this.CalculatePow(input, output);
    this.CalculateRPM(input, output);
    this.CalculateCal(input, output);

    output.powerLostToMechanicalLossesInPercentage = 100 * output.powerLostToMechanicalLossesInHP / output.requiredTotalInputInHP;
    output.requiredAirPowerInPercentage = 100 * output.requiredAirPowerInHP / output.requiredTotalInputInHP;
    output.requiredRollPowerInPercentage = 100 * output.requiredRollPowerInHP / output.requiredTotalInputInHP;
    output.requiredHillPowerInPercentage = 100 * output.requiredHillPowerInHP / output.requiredTotalInputInHP;
    output.requiredTotalInputInWatts = output.requiredTotalInputInHP * 746;

    return output as IOutput;
  }

  private static CalculateForce(input: IInput, output: IOutput): void {
    const Eff = 1 - input.mechanicalLosses / 100;
    const Wheel = input.wheelDiameterInInches / 2;
    const V = input.desiredConstantSpeedInMilesPerHour * 5280 / 3600;
    const Wt = eval(input.riderWeightInLbs + "+" + input.bikeWeightInLbs);

    const ang = Math.atan(input.gradeInPercent / 100);
    const GearT = (1.0 * input.casetteChainRingTeethCount / input.frontChainRingTeethCount) * input.crankLengthInInches / Wheel;
    const Frr = input.rollingResistanceCoefficient * Wt;
    const Fdr = input.drag * V * V;

    output.requiredAirPowerInHP = (Fdr * V) / 550;
    output.requiredRollPowerInHP = (Frr * V) / 550;
    output.requiredHillPowerInHP = (Wt * Math.sin(ang) * V) / 550;
    const ExtFor = eval(Frr + "+" + Fdr);
    const ForceT = (eval(Wt * Math.sin(ang) + " + " + ExtFor)) / (GearT * Eff);
    output.averagePedalForceInLbs = ForceT;
  }

  private static CalculatePow(input: IInput, output: IOutput): void {
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

  private static CalculateRPM(input: IInput, output: IOutput): void {
    const Eff = 1 - input.mechanicalLosses / 100;
    const Wheel = input.wheelDiameterInInches / 2;
    const ForceT = output.averagePedalForceInLbs;
    const PowerT = output.requiredTotalInputInHP;
    const V = input.desiredConstantSpeedInMilesPerHour * 5280 / 3600;
    const RPMT = (PowerT * 550 * 60) / (ForceT * .5625 * Math.PI * 2);
    output.tireSpeedInRPM = (V * 60 * 12) / (Wheel * Math.PI * 2);
    output.pedalSpeedInRPM = RPMT;
  }

  private static CalculateCal(input: IInput, output: IOutput): void {
    const PowerT = output.requiredTotalInputInHP;
    const V = input.desiredConstantSpeedInMilesPerHour / 3600;
    const CalT = (PowerT * 550) / (V * 3089);
    output.caloriesBurnedPerMile = CalT;
  }
}
