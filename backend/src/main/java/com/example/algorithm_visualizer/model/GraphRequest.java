package com.example.algorithm_visualizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GraphRequest {

    private List<Integer> nodes;
    private List<Edge> edges;
    private int startNode;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Edge {
        private int source;
        private int destination;
        private int weight;
    }
}
