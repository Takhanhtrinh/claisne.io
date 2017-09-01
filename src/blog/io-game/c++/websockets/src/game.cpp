#include "game.hpp"

namespace iogame {
  Game::Game() {
    for (int i = 0; i < food_max; i++) {
      this->foods.push_back(Food { std::rand() % x_max, std::rand() % y_max });
    }
  }

  void Game::onConnection(uWS::WebSocket<uWS::SERVER> *ws) {
    this->connection_count++;

    int id = this->next_id++;

    ws->setUserData(new State(
      id,
      std::rand() % x_max,
      std::rand() % y_max
    ));

    json j = {{"id", id}};
    auto jd = j.dump();
    ws->send(jd.c_str(), uWS::TEXT);
  }

  void Game::onMessage(uWS::WebSocket<uWS::SERVER> *ws, char* message, size_t length) {
    std::string message_s(message, length);
    json message_j = json::parse(message_s);

    if (message_j["x"].is_number_integer() && message_j["y"].is_number_integer()) {
      int x = message_j["x"];
      int y = message_j["y"];

      State *state = (State *) ws->getUserData();
      state->set_position_target(x, y);
    }
  }

  void Game::onDisconnection(uWS::WebSocket<uWS::SERVER> *ws) {
    this->connection_count--;
    delete (State *) ws->getUserData();
  }

  void to_json(json &j, const State *s) {
    j = json{
      {"id", s->id},
      {"x", s->x},
      {"y", s->y},
      {"s", s->size}
    };
  }

  void to_json(json &j, const Food &f) {
    j = json{
      {"x", f.x},
      {"y", f.y}
    };
  }

  void Game::update() {
    auto now = std::chrono::high_resolution_clock::now();

    int dt = std::chrono::duration_cast<std::chrono::milliseconds>(now - this->last_update).count();

    this->hub.getDefaultGroup<uWS::SERVER>().forEach([this, dt](uWS::WebSocket<uWS::SERVER> *ws) {
      State *state = (State *) ws->getUserData();
      state->update_position(dt);

      if (state->x < 0) { state->x = 0; }
      if (state->y < 0) { state->y = 0; }
      if (state->x > x_max) { state->x = x_max; }
      if (state->y > y_max) { state->y = y_max; }

      for (auto food_it = this->foods.begin(); food_it != this->foods.end(); ++food_it) {
        if (state->is_eating(*food_it)) {
          (*food_it).x = std::rand() % x_max;
          (*food_it).y = std::rand() % y_max;

          state->eat();
        }
      }

      // this->hub.getDefaultGroup<uWS::SERVER>().forEach([state](uWS::WebSocket<uWS::SERVER> *ws_opponent) {
      //   State *state_opponent = (State *) ws_opponent->getUserData();
      // });
    });

    this->last_update = now;
  }

  void Game::broadcast() {
    std::vector<State*> states;

    this->hub.getDefaultGroup<uWS::SERVER>().forEach([&states](uWS::WebSocket<uWS::SERVER> *ws) {
      State *state = (State *) ws->getUserData();
      states.push_back(state);
    });

    int timestamp =
      std::chrono::duration_cast<std::chrono::milliseconds>(this->last_update.time_since_epoch()).count();

    json j = {{"states", states}, {"foods", this->foods}, {"timestamp", timestamp}};
    auto jd = j.dump();
    this->hub.getDefaultGroup<uWS::SERVER>().broadcast(jd.c_str(), jd.size(), uWS::TEXT);
  }

  void Game::run() {
    this->hub.onConnection([this](uWS::WebSocket<uWS::SERVER> *ws, uWS::HttpRequest req) {
      this->onConnection(ws);
    });

    this->hub.onMessage([this](uWS::WebSocket<uWS::SERVER> *ws, char *message, size_t length, uWS::OpCode opCode) {
      this->onMessage(ws, message, length);
    });

    this->hub.onDisconnection([this](uWS::WebSocket<uWS::SERVER> *ws, int code, char *message, size_t length) {
      this->onDisconnection(ws);
    });
    
    Timer *timer = new Timer(this->hub.getLoop());
    timer->setData(this);
    timer->start([](Timer *timer) {
      Game *game = (Game*)timer->getData(); 
      game->update();
      game->broadcast();
    }, 0, 1000 / 25);

    if (this->hub.listen(3000)) {
      this->hub.run();
    }
  }
}
