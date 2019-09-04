package com.vadrin.xorlearner.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.vadrin.neuroevolution.controllers.NEAT;
import com.vadrin.neuroevolution.models.Genome;
import com.vadrin.neuroevolution.models.exceptions.InvalidInputException;
import com.vadrin.neuroevolution.services.PoolService;

@RestController
public class XorController{

	private static final double[] input00 = { 0d, 0d };
	private static final double[] input01 = { 0d, 1d };
	private static final double[] input10 = { 1d, 0d };
	private static final double[] input11 = { 1d, 1d };

	@Autowired
	private NEAT neat;
	
	private PoolService poolService;

	@RequestMapping(method = RequestMethod.POST, value = "/neat")
	public List<Genome> instantiate() {
		this.poolService = new PoolService(150, 2, 1);
		return sortedBestGenomeInPool();
	}
	
	@RequestMapping(method = RequestMethod.PUT, value = "/neat")
	public List<Genome> stepOneGeneration() {
		poolService.getGenomes().forEach(genome -> loadFitness(genome));
		neat.stepOneGeneration(poolService);
		Genome thisGenBest = sortedBestGenomeInPool().stream().limit(1).findFirst().get();
		System.out.println(thisGenBest.getFitnessScore() + "|" + thisGenBest.getNodeGenesSorted().size() + "|"
				+ thisGenBest.getId());
		Map<Integer, Integer> nodesMap = new HashMap<Integer, Integer>();
		sortedBestGenomeInPool().forEach(g -> {
			nodesMap.put(g.getNodeGenesSorted().size(),
					nodesMap.containsKey(g.getNodeGenesSorted().size())
							? nodesMap.get(g.getNodeGenesSorted().size()) + 1
							: 1);
		});
		System.out.println("Number of Genomes with Node Sizes: " + nodesMap);
		System.out.println("------------------------"+poolService.getGENERATION()+" generation finished------------------");
		return sortedBestGenomeInPool();
	}
	
	private List<Genome> sortedBestGenomeInPool() {
		return poolService.getGenomes().stream()
				.sorted((a, b) -> Double.compare(b.getFitnessScore(), a.getFitnessScore()))
				.collect(Collectors.toList());
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
