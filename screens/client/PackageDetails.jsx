import React, { useContext, useEffect, useMemo, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import DestinationStyles from "../../styles/clientstyles/DestinationStyles"
import Header from "../../components/Header"
import { UserContext } from "../../context/UserContext"
import ModalStyle from "../../styles/componentstyles/ModalStyle"
import Sidebar from "../../components/Sidebar"


const modalDetails = {
  "1": {
    dateDetails: {
      packageLine: "3 Days 2 Nights land arrangement package.",
      startingDate: "2025-05-18",
      availableTime: "9:00 am",
    },
    availableDates: [
      {
        id: "date-1",
        range: "January 21 - January 26, 2026",
        note: "Baguio peak season slots with guided city tour.",
      },
      {
        id: "date-2",
        range: "February 10 - February 15, 2026",
        note: "Includes Strawberry Farm and Session Road stroll.",
      },
    ],
    allIn: {
      image: "https://i.imgur.com/wwoZU53.png",
      title: "All in Package",
      text:
        "Air or land arrangement with transfers, hotel, and guided tours included.",
    },
    land: {
      image: "https://i.imgur.com/vkmY0GO.png",
      title: "Land Arrangement",
      text:
        "Land-only package with tours, accommodations, and transfers arranged.",
    },
    fixed: {
      image: "https://i.imgur.com/J3tnzCw.png",
      title: "Fixed Package",
      text: "Pre-arranged inclusions for a worry-free Baguio getaway.",
    },
    custom: {
      image: "https://i.imgur.com/IIaHcNF.png",
      title: "Customized Package",
      text: "Pick your preferred hotel, side trips, and add-on experiences.",
    },
    solo: {
      image: "https://i.imgur.com/cu1Wc6u.png",
      title: "Solo Booking",
      text: "A personal itinerary crafted just for you.",
    },
    group: {
      image: "https://i.imgur.com/K8MkNl7.png",
      title: "Grouped Booking",
      text: "Plan a trip for family or friends and enjoy group perks.",
    },
    customize: {
      airline: "Cebu Pacific Air",
      hotel: "Ridgewood Hotel",
    },
  },

  "2": {
    dateDetails: {
      packageLine: "5 Days 4 Nights international package.",
      startingDate: "2025-06-12",
      availableTime: "8:00 am",
    },
    availableDates: [
      {
        id: "date-1",
        range: "March 04 - March 09, 2026",
        note: "Cherry blossom season, includes palace tours.",
      },
      {
        id: "date-2",
        range: "April 15 - April 20, 2026",
        note: "Myeongdong shopping and night market package.",
      },
    ],
    allIn: {
      image: "https://i.imgur.com/wwoZU53.png",
      title: "All in Package",
      text: "International flights, hotel, transfers, and daily tours included.",
    },
    land: {
      image: "https://i.imgur.com/vkmY0GO.png",
      title: "Land Arrangement",
      text: "Ground arrangements only; bring your own flights.",
    },
    fixed: {
      image: "https://i.imgur.com/J3tnzCw.png",
      title: "Fixed Package",
      text: "Set itinerary for a seamless Seoul experience.",
    },
    custom: {
      image: "https://i.imgur.com/IIaHcNF.png",
      title: "Customized Package",
      text: "Build your Seoul journey with flexible activities.",
    },
    solo: {
      image: "https://i.imgur.com/cu1Wc6u.png",
      title: "Solo Booking",
      text: "Independent travel with curated must-see stops.",
    },
    group: {
      image: "https://i.imgur.com/K8MkNl7.png",
      title: "Grouped Booking",
      text: "Perfect for teams and friends traveling together.",
    },
    customize: {
      airline: "Korean Air",
      hotel: "Maple Boutique Hotel",
    },
  },

  "3": {
    dateDetails: {
      packageLine: "4 Days 3 Nights island-hopping package.",
      startingDate: "2025-07-22",
      availableTime: "10:00 am",
    },
    availableDates: [
      {
        id: "date-1",
        range: "May 18 - May 22, 2026",
        note: "Includes Honda Bay island tour.",
      },
      {
        id: "date-2",
        range: "June 02 - June 06, 2026",
        note: "Underground River and El Nido side trip.",
      },
    ],
    allIn: {
      image: "https://i.imgur.com/wwoZU53.png",
      title: "All in Package",
      text: "Flights, island tours, hotel, and transfers included.",
    },
    land: {
      image: "https://i.imgur.com/vkmY0GO.png",
      title: "Land Arrangement",
      text: "Island tours and stays covered, flights excluded.",
    },
    fixed: {
      image: "https://i.imgur.com/J3tnzCw.png",
      title: "Fixed Package",
      text: "Pre-set schedule for beaches and lagoon tours.",
    },
    custom: {
      image: "https://i.imgur.com/IIaHcNF.png",
      title: "Customized Package",
      text: "Choose your islands, resorts, and excursions.",
    },
    solo: {
      image: "https://i.imgur.com/cu1Wc6u.png",
      title: "Solo Booking",
      text: "A flexible island escape for one.",
    },
    group: {
      image: "https://i.imgur.com/K8MkNl7.png",
      title: "Grouped Booking",
      text: "Share island adventures with your group.",
    },
    customize: {
      airline: "Philippine Airlines",
      hotel: "Seaside Cove Resort",
    },
  },
}

const addonOptions = [
  { id: "addon-1", label: "In-flight Meals/Snacks" },
  { id: "addon-2", label: "In-flight Entertainment" },
  { id: "addon-3", label: "In-flight Pillow" },
]

const tourOptions = [
  { id: "tour-1", label: "City Tour" },
  { id: "tour-2", label: "Market Tour" },
  { id: "tour-3", label: "Museum Tour" },
]

const defaultTravelers = {
  adult: 1,
  child: 0,
  infant: 0,
  senior: 0,
}

export default function PackageDetails({ route }) {


  const [modalReviewVisible, setModalReviewVisible] = useState(false)
  const [modalWishlistVisible, setModalWishlistVisible] = useState(false)

  const saveBooking = () => {
    const booking = {
      package: pkg.title,
      date: pkg.isInternational ? availableDateId : selectedDate,
      allInLand,
      fixedCustom,
      soloGrouped,
      totalTravelers,
      paymentMethod: selectedOption,
      price: pkg.price,
      status: "Paid"
    }


  }

  const [isSidebarVisible, setSidebarVisible] = useState(false)

  const pkg = route?.params?.pkg ?? {
    id: "1",
    title: "Baguio City Tour",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/7e/b0/b9/photo4jpg.jpg?w=900&h=500&s=1",
    price: "₱67,000",
    duration: "3 Days",
    isInternational: false,
  }

  const modalContent = modalDetails[pkg.id] ?? modalDetails["1"]

  const [activeTab, setActiveTab] = useState("itinerary")
  const [activeModal, setActiveModal] = useState(null)

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    new Date(modalContent.dateDetails.startingDate).toISOString().slice(0, 10)
  )
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date(modalContent.dateDetails.startingDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  )
  const [availableDateId, setAvailableDateId] = useState(
    () => modalContent.availableDates[0]?.id ?? "March 18, 2026"
  )
  const [allInLand, setAllInLand] = useState("all-in")
  const [fixedCustom, setFixedCustom] = useState("fixed")
  const [soloGrouped, setSoloGrouped] = useState("solo")
  const [travelers, setTravelers] = useState(defaultTravelers)
  const [airline, setAirline] = useState(() => modalContent.customize.airline)
  const [hotel, setHotel] = useState(() => modalContent.customize.hotel)
  const [addons, setAddons] = useState(["addon-1"])
  const [tours, setTours] = useState(["tour-1"])
  const [selectedOption, setSelectedOption] = useState('')

  useEffect(() => {
    if (activeModal === "approval") {
      saveBooking()
    }
  }, [activeModal])

  const getModalTitle = () => {
    if (activeModal === "date") return "Choose Date"
    if (activeModal === "available") return "Available Dates"
    if (activeModal === "allin") return "ALL IN OR LAND"
    if (activeModal === "fixed") return "FIXED OR CUSTOMIZED"
    if (activeModal === "solo") return "SOLO OR GROUPED"
    if (activeModal === "travelers") return "Travelers"
    if (activeModal === "customize") return "Customize"
    if (activeModal === "addons") return "Add-ons"
    if (activeModal === "summary") return "Booking Summary"
    if (activeModal === "payment") return "Payment"
    if (activeModal === "approval") return "Booking for Approval"
    return ""
  }

  const startAvailability = () => {
    setActiveModal(pkg.isInternational ? "available" : "date")
  }

  const nextModal = () => {
    if (activeModal === "date" || activeModal === "available") {
      setActiveModal("allin")
      return
    }
    if (activeModal === "allin") {
      setActiveModal("fixed")
      return
    }
    if (activeModal === "fixed") {
      setActiveModal("solo")
      return
    }
    if (activeModal === "solo") {
      if (soloGrouped === "solo") {
        setTravelers(defaultTravelers)
        setActiveModal("addons")
      } else {
        setActiveModal("travelers")
      }
      return
    }
    if (activeModal === "travelers") {
      if (fixedCustom === "custom") {
        setActiveModal("customize")
      } else {
        setActiveModal("addons")
      }
      return
    }
    if (activeModal === "customize") {
      if (fixedCustom === "custom") {
        setActiveModal("addons")
      } else {
        setActiveModal("addons")
      }
      return
    }
    if (activeModal === "addons") {
      setActiveModal("summary")
      return
    }
    if (activeModal === "summary") {
      setActiveModal("payment")
      return
    }
    if (activeModal === "payment") {
      setActiveModal("approval")
      return
    }
    if (activeModal === "approval") {
      setActiveModal(null)
    }
  }

  const prevModal = () => {
    if (activeModal === "approval") {
      return
    }
    if (activeModal === "summary") {
      setActiveModal("addons")
      return
    }
    if (activeModal === "addons") {
      if (fixedCustom === "custom") {
        setActiveModal("customize")
      } else {
        setActiveModal(soloGrouped === "solo" ? "solo" : "travelers")
      }
      return
    }
    if (activeModal === "customize") {
      setActiveModal("travelers")
      return
    }
    if (activeModal === "travelers") {
      setActiveModal("solo")
      return
    }
    if (activeModal === "solo") {
      setActiveModal("fixed")
      return
    }
    if (activeModal === "fixed") {
      setActiveModal("allin")
      return
    }
    if (activeModal === "allin") {
      setActiveModal(pkg.isInternational ? "available" : "date")
      return
    }
    if (activeModal === "date" || activeModal === "available") {
      setActiveModal(null)
    }
  }

  const closeModal = () => setActiveModal(null)

  const handleDateSelect = (day) => {
    setSelectedDateKey(day.dateString)
    const parsedDate = new Date(day.dateString)
    setSelectedDate(
      parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    )
  }

  const adjustTraveler = (key, num) => {
    setTravelers((prev) => {
      const nextValue = Math.max(0, prev[key] + num)
      return { ...prev, [key]: nextValue }
    })
  }

  const toggleItem = (items, setItems, id) => {
    if (items.includes(id)) {
      setItems(items.filter((item) => item !== id))
      return
    }
    setItems([...items, id])
  }

  const totalTravelers = travelers.adult + travelers.child + travelers.infant + travelers.senior

  const PaymentCard = ({ value, logo }) => (
    <TouchableOpacity
      style={[
        DestinationStyles.paymentCard,
        selectedOption === value && DestinationStyles.paymentCardSelected
      ]}
      onPress={() => { setSelectedOption(value) }}
      activeOpacity={0.8}
    >
      <Image source={logo} style={DestinationStyles.payementCardLogo} />
    </TouchableOpacity>
  )

  const SelectableCard = ({ selected, onPress, image, title, text }) => (
    <TouchableOpacity
      style={[
        DestinationStyles.cardOption,
        selected && DestinationStyles.cardOptionSelected
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={image} style={DestinationStyles.optionImage} />
      <Text style={DestinationStyles.cardOptionTitle}>{title}</Text>
      <Text style={DestinationStyles.cardOptionText}>{text}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={DestinationStyles.detailsContainer}>
      <Header openSidebar={() => { setSidebarVisible(true) }} />
      <Sidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />


      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={DestinationStyles.detailsHeader}>
          <View style={DestinationStyles.titleRow}>
            <Text style={DestinationStyles.detailsTitle}>{pkg.title}</Text>
            <View style={DestinationStyles.daysBadge}>
              <Text style={DestinationStyles.daysText}>{pkg.duration}</Text>
            </View>
          </View>
          <Image source={{ uri: pkg.image }} style={DestinationStyles.heroImage} />
        </View>

        <View style={DestinationStyles.heroCard}>
          <Text style={DestinationStyles.heroDescription}>{pkg.description}</Text>
          <View style={DestinationStyles.priceRow}>
            <View>
              <Text style={DestinationStyles.priceLabel}>FROM</Text>
              <Text style={DestinationStyles.priceValue}>{pkg.price}</Text>
              <Text style={DestinationStyles.priceUnit}>/Adult</Text>
            </View>
            <TouchableOpacity
              style={DestinationStyles.availabilityButton}
              onPress={startAvailability}
            >
              <Text style={DestinationStyles.availabilityText}>Check Availability</Text>
            </TouchableOpacity>
          </View>

          <View style={DestinationStyles.wishlistContainer}>
            <TouchableOpacity
              onPress={() => {
                setModalWishlistVisible(true)
              }}
              style={DestinationStyles.wishlistButton}
            >
              <Ionicons
                name={"heart"}
                size={18}
                color={"#fff"}
                style={{ marginRight: 6 }}
              />
              <Text style={DestinationStyles.wishlistButtonText}>
                Add to Wishlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={DestinationStyles.tabRow}>
          {["itinerary", "inclusions", "terms"].map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                DestinationStyles.tabButton,
                index === 2 && { borderRightWidth: 0 },
                activeTab === tab && DestinationStyles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={DestinationStyles.tabText}>
                {tab === "itinerary" && "Itinerary"}
                {tab === "inclusions" && "Inclusions & Exclusions"}
                {tab === "terms" && "Terms & Conditions"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={DestinationStyles.sectionBody}>
          {activeTab === "itinerary" && (
            <>
              <Text style={DestinationStyles.sectionTitle}>DAY 1</Text>
              <Text style={DestinationStyles.sectionText}>
                Arrive at the Destination and Check-in to the Hotel
              </Text>
            </>
          )}
          {activeTab === "inclusions" && (
            <>
              <Text style={DestinationStyles.sectionTitle}>INCLUSIONS AND EXCLUSIONS</Text>
              <Text style={DestinationStyles.sectionText}>

                Inclusions: Breakfast Buffet
                Exclusions: Tips for the Tour Guide
              </Text>
            </>
          )}
          {activeTab === "terms" && (
            <>
              <Text style={DestinationStyles.sectionTitle}>TERMS AND CONDITIONS</Text>
              <Text style={DestinationStyles.sectionText}>
                No late cancellations
              </Text>
            </>
          )}
        </View>

        <View style={DestinationStyles.reviewContainer}>

          <View style={DestinationStyles.recentReviewContainer}>
            <Text style={DestinationStyles.userReview}>
              Marion Balmonte
            </Text>
            <View style={DestinationStyles.userStarContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={14} color="#f5a623" />
              ))}
            </View>

            <Text>
              The tour guide is really nice! Everything is organized well. Would book again!
            </Text>
          </View>

          <View style={DestinationStyles.recentReviewContainer}>
            <Text style={DestinationStyles.userReview}>
              Janssen Bauca
            </Text>
            <View style={DestinationStyles.userStarContainer}>
              {[1, 2, 3].map((star) => (
                <Ionicons key={star} name="star" size={14} color="#f5a623" />
              ))}
            </View>

            <Text>
              Service could be better.
            </Text>
          </View>


          <Text style={DestinationStyles.reviewTitle}>
            Write a Review
          </Text>
          <View style={DestinationStyles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => {
              <TouchableOpacity key={star}>
                <Ionicons
                  name="star-outline"
                  size={22}
                  color="#f5a623"
                  style={{ marginRight: 4 }}
                />
              </TouchableOpacity>
            })}
          </View>

          <TextInput
            style={DestinationStyles.reviewInput}
            placeholder="Share your experience..."
            multiline
          />

          <TouchableOpacity
            onPress={() => {
              setModalReviewVisible(true)
            }}
            style={DestinationStyles.reviewButton}
          >
            <Text style={DestinationStyles.reviewButtonText}>
              Submit Review
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>

      <Modal visible={activeModal !== null} transparent animationType="fade">
        <View style={DestinationStyles.modalOverlay}>
          <View style={DestinationStyles.modalCard}>
            <View style={DestinationStyles.modalHeader}>
              <Text style={DestinationStyles.modalTitle}>{getModalTitle()}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={18} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={DestinationStyles.modalBody}>
              {activeModal === "date" && (
                <>
                  <View style={DestinationStyles.calendarBox}>
                    <Text style={DestinationStyles.modalParagraph}>Choose Date</Text>
                    <Calendar
                      current={selectedDateKey}
                      onDayPress={handleDateSelect}
                      markedDates={{
                        [selectedDateKey]: {
                          selected: true,
                          selectedColor: "#305797",
                        },
                      }}
                      theme={{
                        arrowColor: "#305797",
                        todayTextColor: "#305797",
                        textMonthFontWeight: "700",
                        textDayHeaderFontWeight: "600",
                      }}
                      style={DestinationStyles.calendar}
                    />
                  </View>
                  <Text style={DestinationStyles.modalSubTitle}>Package Details</Text>
                  <View style={DestinationStyles.modalBox}>
                    <Text style={DestinationStyles.modalParagraph}>{pkg.title}</Text>
                    <Text style={DestinationStyles.modalParagraph}>
                      {modalContent.dateDetails.packageLine}
                    </Text>
                    <Text style={DestinationStyles.modalParagraph}>
                      Starting Date: {selectedDate}
                    </Text>
                    <Text style={DestinationStyles.modalParagraph}>
                      Available Time: {modalContent.dateDetails.availableTime}
                    </Text>
                  </View>
                </>
              )}

              {activeModal === "available" && (
                <>
                  {modalContent.availableDates.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={DestinationStyles.cardOption}
                      onPress={() => setAvailableDateId(option.range)}
                    >
                      <View style={DestinationStyles.radioRow}>
                        <View style={DestinationStyles.radioOuter}>
                          {availableDateId === option.range && (
                            <View style={DestinationStyles.radioInner} />
                          )}
                        </View>
                        <Text style={DestinationStyles.cardOptionTitle}>{option.range}</Text>
                      </View>
                      <Text style={DestinationStyles.cardOptionText}>{option.note}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {activeModal === "allin" && (
                <>
                  <SelectableCard
                    selected={allInLand === "all-in"}
                    onPress={() => setAllInLand("all-in")}
                    image={modalContent.allIn.image}
                    title={modalContent.allIn.title}
                    text={modalContent.allIn.text}
                  />

                  <SelectableCard
                    selected={allInLand === "land"}
                    onPress={() => setAllInLand("land")}
                    image={modalContent.land.image}
                    title={modalContent.land.title}
                    text={modalContent.land.text}
                  />
                </>
              )}

              {activeModal === "fixed" && (
                <>
                  <SelectableCard
                    selected={fixedCustom === "fixed"}
                    onPress={() => {
                      setFixedCustom("fixed")
                      setAirline(modalContent.customize.airline)
                      setHotel(modalContent.customize.hotel)
                    }}
                    image={modalContent.fixed.image}
                    title={modalContent.fixed.title}
                    text={modalContent.fixed.text}
                  />

                  <SelectableCard
                    selected={fixedCustom === "custom"}
                    onPress={() => setFixedCustom("custom")}
                    image={modalContent.custom.image}
                    title={modalContent.custom.title}
                    text={modalContent.custom.text}
                  />
                </>
              )}

              {activeModal === "solo" && (
                <>
                  <SelectableCard
                    selected={soloGrouped === "solo"}
                    onPress={() => setSoloGrouped("solo")}
                    image={modalContent.solo.image}
                    title={modalContent.solo.title}
                    text={modalContent.solo.text}
                  />

                  <SelectableCard
                    selected={soloGrouped === "group"}
                    onPress={() => setSoloGrouped("group")}
                    image={modalContent.group.image}
                    title={modalContent.group.title}
                    text={modalContent.group.text}
                  />
                </>
              )}

              {activeModal === "travelers" && (
                <View style={DestinationStyles.modalBox}>
                  <View style={DestinationStyles.travelerRow}>
                    <View>
                      <Text style={DestinationStyles.travelerLabel}>Adult</Text>
                      <Text style={DestinationStyles.travelerSub}>
                        Age 18 years and above
                      </Text>
                    </View>
                    <View style={DestinationStyles.counter}>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("adult", -1)}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text style={DestinationStyles.counterValue}>{travelers.adult}</Text>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("adult", 1)}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={DestinationStyles.travelerRow}>
                    <View>
                      <Text style={DestinationStyles.travelerLabel}>Child</Text>
                      <Text style={DestinationStyles.travelerSub}>Age 2-17 years old</Text>
                    </View>
                    <View style={DestinationStyles.counter}>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("child", -1)}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text style={DestinationStyles.counterValue}>{travelers.child}</Text>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("child", 1)}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={DestinationStyles.travelerRow}>
                    <View>
                      <Text style={DestinationStyles.travelerLabel}>Infant</Text>
                      <Text style={DestinationStyles.travelerSub}>Age 0-23 months</Text>
                    </View>
                    <View style={DestinationStyles.counter}>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("infant", -1)}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text style={DestinationStyles.counterValue}>{travelers.infant}</Text>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("infant", 1)}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={DestinationStyles.travelerRow}>
                    <View>
                      <Text style={DestinationStyles.travelerLabel}>Senior/PWD</Text>
                      <Text style={DestinationStyles.travelerSub}>Age 60+ or with ID</Text>
                    </View>
                    <View style={DestinationStyles.counter}>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("senior", -1)}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <Text style={DestinationStyles.counterValue}>{travelers.senior}</Text>
                      <TouchableOpacity
                        style={DestinationStyles.counterButton}
                        onPress={() => adjustTraveler("senior", 1)}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {activeModal === "customize" && (
                <>
                  <View style={DestinationStyles.selectRow}>
                    <Text style={DestinationStyles.modalParagraph}>Select your Airlines...</Text>
                    <Text style={DestinationStyles.modalParagraph}>{airline}</Text>
                  </View>
                  <View style={DestinationStyles.selectRow}>
                    <Text style={DestinationStyles.modalParagraph}>Select your Hotel...</Text>
                    <Text style={DestinationStyles.modalParagraph}>{hotel}</Text>
                  </View>
                </>
              )}

              {activeModal === "addons" && (
                <>
                  <View style={DestinationStyles.modalBox}>
                    <Text style={DestinationStyles.modalSubTitle}>Flight Add-ons</Text>
                    {addonOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={DestinationStyles.checkboxRow}
                        onPress={() => toggleItem(addons, setAddons, option.id)}
                      >
                        <View style={DestinationStyles.checkbox}>
                          {addons.includes(option.id) && (
                            <View style={DestinationStyles.checkboxFill} />
                          )}
                        </View>
                        <Text style={DestinationStyles.checkboxLabel}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[DestinationStyles.modalBox, { marginTop: 12 }]}
                  >
                    <Text style={DestinationStyles.modalSubTitle}>Optional Tours</Text>
                    {tourOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={DestinationStyles.checkboxRow}
                        onPress={() => toggleItem(tours, setTours, option.id)}
                      >
                        <View style={DestinationStyles.checkbox}>
                          {tours.includes(option.id) && (
                            <View style={DestinationStyles.checkboxFill} />
                          )}
                        </View>
                        <Text style={DestinationStyles.checkboxLabel}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {activeModal === "summary" && (
                <View style={DestinationStyles.modalBox}>
                  <Text style={DestinationStyles.summaryText}>Package: {pkg.title}</Text>
                  <Text style={DestinationStyles.summaryText}>
                    Date: {pkg.isInternational ? "Jan. 21" : selectedDate}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    All in or Land: {allInLand === "all-in" ? "All in" : "Land"}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Fixed or Custom: {fixedCustom === "fixed" ? "Fixed" : "Custom"}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Solo or Grouped: {soloGrouped === "solo" ? "Solo" : "Grouped"}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Travelers: {totalTravelers}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>Airlines: {airline}</Text>
                  <Text style={DestinationStyles.summaryText}>Hotel: {hotel}</Text>
                  <Text style={DestinationStyles.summaryText}>
                    Flight Add-ons: {addons.length} selected
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Optional Tours: {tours.length} selected
                  </Text>
                  <Text style={DestinationStyles.summaryWarning}>
                    MUST READ! Please double check everything before confirming.
                  </Text>
                </View>
              )}

              {activeModal === "payment" && (
                <View style={DestinationStyles.modalBox}>
                  <Text style={DestinationStyles.paymentCard}>Payment Method</Text>
                  <Text style={DestinationStyles.paymentSectionTitle}>E-Wallet</Text>
                  <View style={DestinationStyles.paymentCardRow}>
                    <PaymentCard
                      value="gcash"
                      logo={require('../../assets/images/gcash_logo.png')}
                    />

                    <PaymentCard
                      value="paypal"
                      logo={require('../../assets/images/paypal_logo.png')}
                    />
                  </View>

                  <Text style={DestinationStyles.paymentSectionTitle}>Bank</Text>

                  <View style={DestinationStyles.paymentCardRow}>
                    <PaymentCard
                      value="bdo"
                      logo={require('../../assets/images/bdo_logo.png')}
                    />

                    <PaymentCard
                      value="metrobank"
                      logo={require('../../assets/images/metrobank_logo.png')}
                    />
                  </View>

                  <View style={DestinationStyles.paymentSummaryCard}>
                    <Text style={DestinationStyles.paymentSummaryTitle}>
                      You are about to pay
                    </Text>

                    <View style={DestinationStyles.paymentSummaryRow}>
                      <Text style={DestinationStyles.paymentLabel}>
                        Tour Package
                      </Text>
                      <Text style={DestinationStyles.paymentValue}>
                        {pkg.title}
                      </Text>
                    </View>

                    <View style={DestinationStyles.paymentSummaryRow}>
                      <Text style={DestinationStyles.paymentLabel}>
                        Payment Plan
                      </Text>
                      <Text style={DestinationStyles.paymentValue}>
                        Installment - Down Payment
                      </Text>
                    </View>

                    <View style={DestinationStyles.paymentDivider} />

                    <Text style={DestinationStyles.paymentSummaryAmount}>
                      {pkg.price}
                    </Text>

                    <Text style={DestinationStyles.paymentSummarySubtext}>
                      Amount to be charged using selected payment method
                    </Text>
                  </View>
                </View>
              )}

              {activeModal === "approval" && (
                <View style={DestinationStyles.approvalCard}>
                  <View style={DestinationStyles.approvalIcon}>
                    <Ionicons name="checkmark" size={28} color="#fff" />
                  </View>
                  <Text style={DestinationStyles.approvalText}>Booking Successful</Text>
                </View>
              )}
            </View>

            {activeModal !== "approval" && (
              <View style={DestinationStyles.modalButtonRow}>
                <TouchableOpacity style={DestinationStyles.primaryButton} onPress={nextModal}>
                  <Text style={DestinationStyles.primaryText}>Proceed</Text>
                </TouchableOpacity>
                <TouchableOpacity style={DestinationStyles.dangerButton} onPress={prevModal}>
                  <Text style={DestinationStyles.primaryText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeModal === "approval" && (
              <View style={DestinationStyles.modalButtonRow}>
                <TouchableOpacity style={DestinationStyles.primaryButton} onPress={closeModal}>
                  <Text style={DestinationStyles.primaryText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType='fade'
        visible={modalWishlistVisible}
        onRequestClose={() => { setModalWishlistVisible }}
      >

        <View style={ModalStyle.modalOverlay}>
          <View style={ModalStyle.modalBox}>
            <Text style={ModalStyle.modalTitle}>Added to Wishlist</Text>
            <Text style={ModalStyle.modalText}>Package has been added to Wishlist!</Text>


            <TouchableOpacity
              style={ModalStyle.modalButton}
              onPress={() => {
                setModalWishlistVisible(false)
              }}
            >
              <Text style={ModalStyle.modalButtonText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType='fade'
        visible={modalReviewVisible}
        onRequestClose={() => { setModalReviewVisible }}
      >

        <View style={ModalStyle.modalOverlay}>
          <View style={ModalStyle.modalBox}>
            <Text style={ModalStyle.modalTitle}>Review Submitted</Text>
            <Text style={ModalStyle.modalText}>You have reviewed this package successfully!</Text>


            <TouchableOpacity
              style={ModalStyle.modalButton}
              onPress={() => {
                setModalReviewVisible(false)
              }}
            >
              <Text style={ModalStyle.modalButtonText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


    </View>
  )
}