
// Code under test
import { BikeCalculator, IInput, IOutput } from "../BikeCalculator";

// Test infra
import * as chai from "chai";
const expect = chai.expect;

// Test input - baseline values
let input: IInput;

// Tests themselves
describe("#test-calculations", () => {
    beforeEach(() => {
        input = {
            bikeWeightInLbs: 19.84, // 9 kg
            casetteChainRingTeethCount: 28,
            crankLengthInInches: 6.69, // 170mm
            desiredConstantSpeedInMilesPerHour: 6.214, //  10 km/h
            drag: 0.004, // Air Resistance Coefficient (lbf*s^2/ft^2), Straight Arms (Cd*A =.004), Full Crouch (Cd*A =.0032),  Hill Descent (Cd*A =.0027), No Rider (Cd*A=.0012), Zero Air Drag (Cd*A=0)
            frontChainRingTeethCount: 34,
            gradeInPercent: 10, // Hill incline
            mechanicalLosses: 5.0, // (3-5% is typical)
            riderWeightInLbs: 180.0, // 82 kg
            rollingResistanceCoefficient: 0.004, // (lbf/lbf), 0.004 (27x1.125" 95 psi Road Clinchers Racing Tires)
            wheelDiameterInInches: 27.0,
        };
    });

    it("baseline values", () => {

        // Where power goes?
        expect(Math.round(BikeCalculator.calculate(input).requiredHillPowerInPercentage)).to.be.eql(90);
        expect(Math.round(BikeCalculator.calculate(input).requiredAirPowerInPercentage)).to.be.eql(2);
        expect(Math.round(BikeCalculator.calculate(input).requiredRollPowerInPercentage)).to.be.eql(4);
        expect(Math.round(BikeCalculator.calculate(input).powerLostToMechanicalLossesInPercentage)).to.be.eql(5);

        // What is needed?
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(273);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("lose 5kg", () => {
        input.riderWeightInLbs -= 11;
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(259);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("lose 10kg", () => {
        input.riderWeightInLbs -= 22;
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(244);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 15%", () => {
        input.gradeInPercent = 15;
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(400);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 20%", () => {
        input.gradeInPercent = 20;
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(525);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("climb 25%", () => {
        input.gradeInPercent = 25;
        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(645);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get compact chainset", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 28;

        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(273);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(63);
    });

    it("get compact chainset and 32 chainring back", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 32;

        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(273);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(72);
    });

    it("get compact chainset and 34 chainring back", () => {
        input.frontChainRingTeethCount = 34;
        input.casetteChainRingTeethCount = 34;

        expect(Math.round(BikeCalculator.calculate(input).requiredTotalInputInWatts)).to.be.eql(273);
        expect(Math.round(BikeCalculator.calculate(input).pedalSpeedInRPM)).to.be.eql(77);
    });
});
