package com.vadrin.xorlearner.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Controller;

import com.vadrin.neuroevolution.controllers.NEAT;
import com.vadrin.neuroevolution.models.Genome;
import com.vadrin.neuroevolution.models.exceptions.InvalidInputException;


@Controller
public class XorController implements ApplicationRunner {

	private static final double[] input00 = { 0d, 0d };
	private static final double[] input01 = { 0d, 1d };
	private static final double[] input10 = { 1d, 0d };
	private static final double[] input11 = { 1d, 1d };

	@Autowired
	private NEAT neat;

	@Override
	public void run(ApplicationArguments args) throws Exception {
		neat.instantiateNEAT(250, 2, 1);
		neat.sortedBestGenomeInPool().forEach(
				g -> System.out.println(g.getFitnessScore() + "|" + g.getNodeGenesSorted().size() + "|" + g.getId()));
		System.out.println("-----------------------------------------------");
		for (int i = 0; i < 1000; i++) {
			neat.getGenomes().forEach(genome -> loadFitness(genome));
			neat.stepOneGeneration();
			neat.sortedBestGenomeInPool().stream().limit(1).forEach(g -> System.out
					.println(g.getFitnessScore() + "|" + g.getNodeGenesSorted().size() + "|" + g.getId()));
			System.out.println("-----------------------------------------------");
		}
	}
	
	private void loadFitness(Genome genome) {
		try {
			double[] output00 = neat.process(genome.getId(), input00);
			double[] output01 = neat.process(genome.getId(), input01);
			double[] output10 = neat.process(genome.getId(), input10);
			double[] output11 = neat.process(genome.getId(), input11);
			double fitnessToSet = Math.pow(4d - (Math.abs(output00[0] - 0d) + Math.abs(output01[0] - 1d)
			+ Math.abs(output10[0] - 1d) + Math.abs(output11[0] - 0d)), 2);
			genome.setFitnessScore(fitnessToSet);
		} catch (InvalidInputException e) {
			e.printStackTrace();
		}
	}

}
