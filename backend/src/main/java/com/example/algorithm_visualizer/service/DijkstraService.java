package com.example.algorithm_visualizer.service;

import com.example.algorithm_visualizer.model.AlgorithmStep;
import com.example.algorithm_visualizer.model.GraphRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DijkstraService {

    public List<AlgorithmStep> solve(GraphRequest request) {
        List<AlgorithmStep> steps = new ArrayList<>();
        List<Integer> nodes = request.getNodes();
        List<GraphRequest.Edge> edges = request.getEdges();
        int startNode = request.getStartNode();

        Map<Integer, List<GraphRequest.Edge>> adj = new HashMap<>();
        for (int node : nodes) {
            adj.put(node, new ArrayList<>());
        }
        for (GraphRequest.Edge edge : edges) {
            adj.get(edge.getSource()).add(edge);
        }

        Map<Integer, Integer> distances = new HashMap<>();
        for (int node : nodes) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(startNode, 0);

        Map<Integer, Integer> previousNodes = new HashMap<>();
        Set<Integer> visitedNodes = new HashSet<>();

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.add(new int[]{startNode, 0});

        steps.add(new AlgorithmStep(-1, new ArrayList<>(visitedNodes), new HashMap<>(distances), new HashMap<>(previousNodes), "Initialization: Set all distances to infinity, except for the start node (0)."));

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int u = current[0];

            if (visitedNodes.contains(u)) {
                continue;
            }
            visitedNodes.add(u);
            steps.add(new AlgorithmStep(u, new ArrayList<>(visitedNodes), new HashMap<>(distances), new HashMap<>(previousNodes), "Visiting node " + u));


            for (GraphRequest.Edge edge : adj.get(u)) {
                int v = edge.getDestination();
                int weight = edge.getWeight();

                if (!visitedNodes.contains(v) && distances.get(u) + weight < distances.get(v)) {
                    int oldDist = distances.get(v);
                    distances.put(v, distances.get(u) + weight);
                    previousNodes.put(v, u);
                    pq.add(new int[]{v, distances.get(v)});
                    steps.add(new AlgorithmStep(u, new ArrayList<>(visitedNodes), new HashMap<>(distances), new HashMap<>(previousNodes), "Updating distance to node " + v + " from " + (oldDist == Integer.MAX_VALUE ? "infinity" : oldDist) + " to " + distances.get(v)));
                }
            }
        }
        steps.add(new AlgorithmStep(-1, new ArrayList<>(visitedNodes), new HashMap<>(distances), new HashMap<>(previousNodes), "Algorithm finished."));
        return steps;
    }
}
