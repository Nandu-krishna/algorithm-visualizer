package com.example.algorithm_visualizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlgorithmStep {
    private int currentNode;
    private List<Integer> visitedNodes;
    private Map<Integer, Integer> distances;
    private Map<Integer, Integer> previousNodes;
    private String description;
}
