# Graph Algorithm Visualizer

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green)
![React](https://img.shields.io/badge/React-Vite-blueviolet)
![D3.js](https://img.shields.io/badge/D3.js-orange)

A full-stack web application that visually demonstrates how graph algorithms work step by step. Users can build custom graphs by adding nodes and edges, then run Dijkstra's or BFS algorithm and watch it execute one step at a time with color-coded node states and real-time distance updates.

## Features

-   **Interactive Graph Builder**: Add and remove nodes and edges dynamically.
-   **Two Algorithms**: Visualize Dijkstra's (weighted shortest path) and BFS (unweighted shortest path).
-   **Step-by-Step Visualization**: Control the algorithm's execution with Previous, Next, and Auto-play controls.
-   **Color-Coded Nodes**: Understand the state of each node with clear color distinctions (blue for start, yellow for current, green for visited).
-   **Real-Time Updates**: A distances table updates at each step of the algorithm.
-   **Speed Control**: Adjust the speed of the auto-play visualization with a slider.

## Tech Stack

-   **Backend**: Java 17, Spring Boot 3.4, Maven
-   **Frontend**: React (with Vite), D3.js, Axios
-   **Algorithms**: Dijkstra's Shortest Path, Breadth-First Search (BFS)

## How It Works

The application follows a client-server architecture. The Spring Boot backend exposes a REST API that computes the entire sequence of steps for a given graph algorithm. The React frontend consumes this API, receiving a JSON array where each object represents a single state in the algorithm's execution. The frontend then uses D3.js to render the graph and visualize each step, updating node colors and distance values based on the data received from the backend.

## Screenshots

*(Add your screenshots here to showcase the application)*

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Java 17+
-   Node.js 18+
-   Maven 3.9+

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd algorithm-visualizer
    ```

2.  **Run the Backend:**
    The backend runs on port `8080`.
    ```sh
    cd backend
    mvn spring-boot:run
    ```

3.  **Run the Frontend:**
    The frontend runs on port `5173`.
    ```sh
    cd frontend
    npm install
    npm run dev
    ```

## API Reference

The backend provides two main endpoints for running the algorithms.

### `POST /api/dijkstra`

Computes the steps for Dijkstra's algorithm.

**Request Body:**

```json
{
  "nodes": [1, 2, 3, 4],
  "edges": [{"source": 1, "destination": 2, "weight": 4}],
  "startNode": 1
}
```

### `POST /api/bfs`

Computes the steps for the Breadth-First Search algorithm.

**Request Body:**

```json
{
  "nodes": [1, 2, 3, 4],
  "edges": [{"source": 1, "destination": 2, "weight": 1}],
  "startNode": 1
}
```
