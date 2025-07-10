"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Flame, Target, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Habit {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
  completions: Record<string, boolean>
}

const HABIT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-red-500",
]

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: "", description: "" })

  // Load habits from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (!newHabit.name.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      color: HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
      createdAt: new Date().toISOString(),
      completions: {},
    }

    setHabits([...habits, habit])
    setNewHabit({ name: "", description: "" })
    setIsAddDialogOpen(false)
  }

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completions: {
              ...habit.completions,
              [date]: !habit.completions[date],
            },
          }
        }
        return habit
      }),
    )
  }

  const getStreak = (habit: Habit) => {
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      if (habit.completions[dateStr]) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const getCompletionRate = (habit: Habit) => {
    const completions = Object.values(habit.completions)
    if (completions.length === 0) return 0
    return Math.round((completions.filter(Boolean).length / completions.length) * 100)
  }

  const getLast7Days = () => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
      })
    }

    return days
  }

  const today = new Date().toISOString().split("T")[0]
  const last7Days = getLast7Days()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Habit Tracker</h1>
          <p className="text-slate-600">Build better habits, one day at a time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habits.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {habits.filter((habit) => habit.completions[today]).length}/{habits.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habits.length > 0 ? Math.max(...habits.map(getStreak)) : 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Habit Button */}
        <div className="mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
                <DialogDescription>Create a new habit to track daily</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habit-name">Habit Name</Label>
                  <Input
                    id="habit-name"
                    placeholder="e.g., Drink 8 glasses of water"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="habit-description">Description (optional)</Label>
                  <Input
                    id="habit-description"
                    placeholder="Why is this habit important to you?"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  />
                </div>
                <Button onClick={addHabit} className="w-full">
                  Add Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">Start building better habits by adding your first one</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const streak = getStreak(habit)
              const completionRate = getCompletionRate(habit)

              return (
                <Card key={habit.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${habit.color}`} />
                        <div>
                          <CardTitle className="text-lg">{habit.name}</CardTitle>
                          {habit.description && <CardDescription>{habit.description}</CardDescription>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Flame className="h-3 w-3" />
                          <span>{streak}</span>
                        </Badge>
                        <Badge variant="outline">{completionRate}% complete</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Overall Progress</span>
                          <span>{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>

                      {/* Last 7 Days */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Last 7 Days</h4>
                        <div className="flex space-x-2">
                          {last7Days.map((day) => (
                            <button
                              key={day.date}
                              onClick={() => toggleHabit(habit.id, day.date)}
                              className={`flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${
                                habit.completions[day.date]
                                  ? `${habit.color} border-transparent text-white`
                                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                              }`}
                            >
                              <span className="text-xs font-medium">{day.dayName}</span>
                              <span className="text-sm">{day.dayNumber}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
