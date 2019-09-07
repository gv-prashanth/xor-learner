package com.vadrin.xorlearner.controller;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vadrin.neuroevolution.models.Genome;
import com.vadrin.neuroevolution.models.Pool;
import com.vadrin.neuroevolution.models.exceptions.InvalidInputException;
import com.vadrin.neuroevolution.services.NEAT;

@RestController
public class XorController{

	private static final double[] input00 = { 0d, 0d };
	private static final double[] input01 = { 0d, 1d };
	private static final double[] input10 = { 1d, 0d };
	private static final double[] input11 = { 1d, 1d };

	@Autowired
	private NEAT neat;
	
	private Pool pool;

	@PostConstruct
	@RequestMapping(method = RequestMethod.POST, value = "/neat")
	public Genome instantiate() {
		this.pool = new Pool(150, 2, 1);
		return this.pool.getGenomes().get(0);
	}
	
	@RequestMapping(method = RequestMethod.PUT, value = "/neat")
	public Genome stepOneGeneration() {
		pool.getGenomes().forEach(genome -> loadFitness(genome));
		neat.stepOneGeneration(pool);
		return pool.getGenomes().get(0);
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/output")
	public double[] calculate(@RequestParam("input1") double input1, @RequestParam("input2") double input2) throws InvalidInputException {
		double[] input = new double[2];
		input[0] = input1;
		input[1] = input2;
		return neat.process(pool.getGenomes().get(0), input);
	}
	
	private void loadFitness(Genome genome) {
		try {
			double[] output00 = neat.process(genome, input00);
			double[] output01 = neat.process(genome, input01);
			double[] output10 = neat.process(genome, input10);
			double[] output11 = neat.process(genome, input11);
			double fitnessToSet = Math.pow(4d - (Math.abs(output00[0] - 0d) + Math.abs(output01[0] - 1d)
					+ Math.abs(output10[0] - 1d) + Math.abs(output11[0] - 0d)), 2);
			genome.setFitnessScore(fitnessToSet);
		} catch (InvalidInputException e) {
			e.printStackTrace();
		}
	}

}
