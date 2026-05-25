package com.example.algorithm_visualizer.controller;

import com.example.algorithm_visualizer.model.AlgorithmStep;
import com.example.algorithm_visualizer.model.GraphRequest;
import com.example.algorithm_visualizer.service.BFSService;
import com.example.algorithm_visualizer.service.DijkstraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AlgorithmController {

    private final DijkstraService dijkstraService;
    private final BFSService bfsService;

    public AlgorithmController(DijkstraService dijkstraService, BFSService bfsService) {
        this.dijkstraService = dijkstraService;
        this.bfsService = bfsService;
    }

    @PostMapping("/dijkstra")
    public List<AlgorithmStep> dijkstra(@RequestBody GraphRequest request) {
        return dijkstraService.solve(request);
    }

    @PostMapping("/bfs")
    public List<AlgorithmStep> bfs(@RequestBody GraphRequest request) {
        return bfsService.solve(request);
    }
}
