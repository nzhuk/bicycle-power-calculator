
// Code under test
import { calculate, Drag, IInput, IOutput, RollingResistanceCoefficient } from "../BikeCalculator";

// Test infra
import * as chai from "chai";
const expect = chai.expect;

// Test input - baseline values
let input: IInput;

// Tests themselves
describe("#test-calculations", () => {
    beforeEach(() => {
        input = {
            bikeWeightInKg: 9,
            casetteChainRingTeethCount: 28,
            crankLengthInMillimeters: 170,
            desiredConstantSpeedInKmPerHour: 10,
            drag: Drag.StraightArms,
            frontChainRingTeethCount: 34,
            gradeInPercent: 10, // Hill incline
            mechanicalLosses: 5, // (3-5% is typical)
            riderWeightInKg: 82,
            rollingResistanceCoefficient: RollingResistanceCoefficient.RoadClinchersRacingTiresAt95Psi,
            wheelDiameterInMillimeters: 685.8,
        };
    });

    it("baseline values", () => {

        // Where power goes?
        expect(Math.round(calculate(input).requiredHillPowerInPercentage)).to.be.eql(90);
        expect(Math.round(calculate(input).requiredAirPowerInPercentage)).to.be.eql(1);
        expect(Math.round(calculate(input).requiredRollPowerInPercentage)).to.be.eql(4);
        expect(Math.round(calculate(input).powerLostToMechanicalLossesInPercentage)).to.be.eql(5);

        // What is needed?
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(275);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("lose 5kg", () => {
        input.riderWeightInKg -= 5;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(260);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get bike which weights 5kg", () => {
        input.bikeWeightInKg = 5;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(263);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get bike which weights nothing", () => {
        input.bikeWeightInKg = 0;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(248);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("lose 10kg", () => {
        input.riderWeightInKg -= 10;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(245);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 15%", () => {
        input.gradeInPercent = 15;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(402);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 20%", () => {
        input.gradeInPercent = 20;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(527);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 25%", () => {
        input.gradeInPercent = 25;
        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(648);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get compact chainset", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 28;

        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(275);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get compact chainset and 32 chainring back", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 32;

        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(275);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(72);
    });

    it("get compact chainset and 34 chainring back", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 34;

        expect(Math.round(calculate(input).requiredTotalInputInWatts)).to.be.eql(275);
        expect(Math.round(calculate(input).pedalSpeedInRPM)).to.be.eql(77);
    });
});
