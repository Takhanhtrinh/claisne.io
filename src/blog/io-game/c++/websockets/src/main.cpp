#include <iostream>
#include <uWS/uWS.h>

#include "game.hpp"

int main() {
  iogame::Game *game = new iogame::Game();
  game->run();
}