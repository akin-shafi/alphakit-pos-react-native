"use client"

import React from "react"
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"

interface DateRangeModalProps {
  visible: boolean
  startDate: Date
  endDate: Date
  onClose: () => void
  onStartDateSelect: (date: Date) => void
  onEndDateSelect: (date: Date) => void
  onQuickFilter: (filter: "today" | "week" | "month") => void
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible,
  startDate,
  endDate,
  onClose,
  onStartDateSelect,
  onEndDateSelect,
  onQuickFilter,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectingStart, setSelectingStart] = React.useState(true)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (selectingStart) {
      onStartDateSelect(selectedDate)
      setSelectingStart(false)
    } else {
      onEndDateSelect(selectedDate)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Date Range</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={Colors.gray900} />
            </TouchableOpacity>
          </View>

          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                onQuickFilter("today")
                onClose()
              }}
            >
              <Text style={styles.quickButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                onQuickFilter("week")
                onClose()
              }}
            >
              <Text style={styles.quickButtonText}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                onQuickFilter("month")
                onClose()
              }}
            >
              <Text style={styles.quickButtonText}>This Month</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionStatus}>
            <Text style={styles.selectionText}>{selectingStart ? "Select Start Date" : "Select End Date"}</Text>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <Feather name="chevron-left" size={24} color={Colors.teal} />
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <Feather name="chevron-right" size={24} color={Colors.teal} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isStart = cellDate.toDateString() === startDate.toDateString()
              const isEnd = cellDate.toDateString() === endDate.toDateString()
              const isInRange = cellDate >= startDate && cellDate <= endDate

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    (isStart || isEnd) && styles.selectedDay,
                    isInRange && !isStart && !isEnd && styles.rangeDay,
                  ]}
                  onPress={() => handleDateSelect(day)}
                >
                  <Text style={[styles.dayText, (isStart || isEnd) && styles.selectedDayText]}>{day}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.selectedRange}>
            <Text style={styles.selectedRangeText}>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gray900,
  },
  quickFilters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    alignItems: "center",
  },
  quickButtonText: {
    fontSize: 12,
    color: Colors.gray700,
    fontWeight: "600",
  },
  selectionStatus: {
    padding: 12,
    backgroundColor: Colors.blue50,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 14,
    color: Colors.info,
    fontWeight: "600",
    textAlign: "center",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray900,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray600,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  selectedDay: {
    backgroundColor: Colors.teal,
    borderRadius: 8,
  },
  rangeDay: {
    backgroundColor: Colors.teal + "20",
  },
  dayText: {
    fontSize: 14,
    color: Colors.gray900,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: "700",
  },
  selectedRange: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  selectedRangeText: {
    fontSize: 14,
    color: Colors.gray700,
    textAlign: "center",
  },
})
