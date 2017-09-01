#include <iostream>
#include <chrono>
#include <uWS/uWS.h>

#include "json.hpp"

using json = nlohmann::json;

#include "state.hpp"

namespace iogame {
  class Game {
  private:
    uWS::Hub hub;

    static const int food_max = 100;
    static const int x_max = 1920;
    static const int y_max = 1080;

    std::chrono::high_resolution_clock::time_point last_update;
    int next_id = 0;
    int connection_count = 0;
    std::vector<Food> foods;

    void update();
    void broadcast();
    void onConnection(uWS::WebSocket<uWS::SERVER> *ws);
    void onMessage(uWS::WebSocket<uWS::SERVER> *ws, char* message, size_t length);
    void onDisconnection(uWS::WebSocket<uWS::SERVER> *ws);
  public:
    Game();
    void run();
  };
}
