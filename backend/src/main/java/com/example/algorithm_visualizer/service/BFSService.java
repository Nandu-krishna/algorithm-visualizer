package com.example.algorithm_visualizer.service;

import com.example.algorithm_visualizer.model.AlgorithmStep;
import com.example.algorithm_visualizer.model.GraphRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BFSService {

    public List<AlgorithmStep> solve(GraphRequest request) {
        List<AlgorithmStep> steps = new ArrayList<>();
        List<Integer> nodes = request.getNodes();
        List<GraphRequest.Edge> edges = request.getEdges();
        int startNode = request.getStartNode();

        Map<Integer, List<Integer>> adj = new HashMap<>();
        for (int node : nodes) {
            adj.put(node, new ArrayList<>());
        }
        for (GraphRequest.Edge edge : edges) {
            adj.get(edge.getSource()).add(edge.getDestination());
        }

        Map<Integer, Integer> distances = new HashMap<>();
        for (int node : nodes) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(startNode, 0);

        Map<Integer, Integer> previousNodes = new HashMap<>();
        Set<Integer> visitedNodes = new HashSet<>();

        Queue<Integer> queue = new LinkedList<>();

        steps.add(new AlgorithmStep(
                -1,
                new ArrayList<>(visitedNodes),
                new HashMap<>(distances),
                new HashMap<>(previousNodes),
                "Initialization: Set all hop distances to unreachable, except the start node (0). BFS ignores edge weights."
        ));

        queue.add(startNode);
        steps.add(new AlgorithmStep(
                startNode,
                new ArrayList<>(visitedNodes),
                new HashMap<>(distances),
                new HashMap<>(previousNodes),
                "Enqueue start node " + startNode + " at the back of the queue with hop distance 0."
        ));

        while (!queue.isEmpty()) {
            int u = queue.poll();
            steps.add(new AlgorithmStep(
                    u,
                    new ArrayList<>(visitedNodes),
                    new HashMap<>(distances),
                    new HashMap<>(previousNodes),
                    "Dequeue node " + u + " from the front of the queue."
            ));

            if (visitedNodes.contains(u)) {
                steps.add(new AlgorithmStep(
                        u,
                        new ArrayList<>(visitedNodes),
                        new HashMap<>(distances),
                        new HashMap<>(previousNodes),
                        "Node " + u + " was already visited; skip processing its neighbors."
                ));
                continue;
            }

            visitedNodes.add(u);
            steps.add(new AlgorithmStep(
                    u,
                    new ArrayList<>(visitedNodes),
                    new HashMap<>(distances),
                    new HashMap<>(previousNodes),
                    "Visiting node " + u + " and exploring its neighbors."
            ));

            for (int v : adj.get(u)) {
                steps.add(new AlgorithmStep(
                        u,
                        new ArrayList<>(visitedNodes),
                        new HashMap<>(distances),
                        new HashMap<>(previousNodes),
                        "Checking neighbor " + v + " of node " + u + " (edge weight is ignored in BFS)."
                ));

                if (distances.get(v) == Integer.MAX_VALUE) {
                    distances.put(v, distances.get(u) + 1);
                    previousNodes.put(v, u);
                    queue.add(v);
                    steps.add(new AlgorithmStep(
                            u,
                            new ArrayList<>(visitedNodes),
                            new HashMap<>(distances),
                            new HashMap<>(previousNodes),
                            "Neighbor " + v + " is undiscovered. Set hop distance to " + distances.get(v)
                                    + " and enqueue " + v + " at the back of the queue."
                    ));
                } else {
                    steps.add(new AlgorithmStep(
                            u,
                            new ArrayList<>(visitedNodes),
                            new HashMap<>(distances),
                            new HashMap<>(previousNodes),
                            "Neighbor " + v + " was already discovered with hop distance "
                                    + distances.get(v) + "; do not enqueue again."
                    ));
                }
            }
        }

        steps.add(new AlgorithmStep(
                -1,
                new ArrayList<>(visitedNodes),
                new HashMap<>(distances),
                new HashMap<>(previousNodes),
                "BFS finished. Distances show the minimum number of hops from the start node."
        ));

        return steps;
    }
}
