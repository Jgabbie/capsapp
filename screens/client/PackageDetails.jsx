import React, { useEffect, useMemo, useState } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert, Linking, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Calendar } from "react-native-calendars"
import DestinationStyles from "../../styles/clientstyles/DestinationStyles"
import Header from "../../components/Header"
import ModalStyle from "../../styles/componentstyles/ModalStyle"
import Sidebar from "../../components/Sidebar"
import { api, withUserHeader } from "../../utils/api"
import { useUser } from "../../context/UserContext"
import { generateBookingInvoicePdf } from "../../utils/bookingInvoicePdf"


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

const toNumber = (value) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatPeso = (value) => `₱${toNumber(value).toLocaleString("en-PH")}`

const formatDateLabel = (value) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const normalizeTextArray = (value) =>
  Array.isArray(value)
    ? value
      .map((item) => {
        if (item == null) return ""
        if (typeof item === "string" || typeof item === "number") return String(item).trim()
        if (typeof item === "object") {
          return String(
            item.label ||
            item.name ||
            item.hotelName ||
            item.airlineName ||
            item.title ||
            item.value ||
            ""
          ).trim()
        }
        return ""
      })
      .filter(Boolean)
    : []

export default function PackageDetails({ route, navigation }) {


  const [modalReviewVisible, setModalReviewVisible] = useState(false)
  const [modalWishlistVisible, setModalWishlistVisible] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const { user } = useUser()

  const [isSidebarVisible, setSidebarVisible] = useState(false)

  const routePackage = route?.params?.pkg ?? {}
  const fallbackPackage = {
    id: "1",
    title: "Baguio City Tour",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/7e/b0/b9/photo4jpg.jpg?w=900&h=500&s=1",
    price: "₱67,000",
    duration: "3 Days",
    packagePricePerPax: 67000,
    packageDuration: 3,
    packageSpecificDate: [],
    packageHotels: [],
    packageAirlines: [],
    packageInclusions: [],
    packageExclusions: [],
    packageTermsConditions: [],
    packageItineraries: [],
    isInternational: false,
  }

  const isInternationalFromPayload =
    typeof routePackage?.isInternational === "boolean"
      ? routePackage.isInternational
      : String(routePackage?.packageType || "")
        .toLowerCase()
        .includes("international")

  const resolvedDurationDays =
    Number(routePackage?.packageDuration) || toNumber(routePackage?.duration) || fallbackPackage.packageDuration
  const resolvedPricePerPax =
    Number(routePackage?.packagePricePerPax) || toNumber(routePackage?.price) || fallbackPackage.packagePricePerPax

  const pkg = {
    ...fallbackPackage,
    ...routePackage,
    id: String(routePackage?.id || routePackage?._id || routePackage?.packageId || fallbackPackage.id),
    title: routePackage?.title || routePackage?.packageName || fallbackPackage.title,
    description: routePackage?.description || routePackage?.packageDescription || fallbackPackage.description,
    image: routePackage?.image || routePackage?.images?.[0] || fallbackPackage.image,
    packageDuration: resolvedDurationDays,
    duration: `${resolvedDurationDays} Days`,
    packagePricePerPax: resolvedPricePerPax,
    price: formatPeso(resolvedPricePerPax),
    packageSpecificDate: Array.isArray(routePackage?.packageSpecificDate)
      ? routePackage.packageSpecificDate
      : fallbackPackage.packageSpecificDate,
    packageHotels: normalizeTextArray(routePackage?.packageHotels),
    packageAirlines: normalizeTextArray(routePackage?.packageAirlines),
    packageInclusions: normalizeTextArray(routePackage?.packageInclusions),
    packageExclusions: normalizeTextArray(routePackage?.packageExclusions),
    packageTermsConditions: normalizeTextArray(routePackage?.packageTermsConditions),
    packageItineraries: normalizeTextArray(routePackage?.packageItineraries),
    isInternational: isInternationalFromPayload,
  }

  const modalContent = modalDetails[pkg.id] ?? modalDetails["1"]

  const availableDates = pkg.packageSpecificDate.length
    ? pkg.packageSpecificDate.map((option, index) => ({
      id: String(index + 1),
      range: `${formatDateLabel(option?.startdaterange)} - ${formatDateLabel(option?.enddaterange)}`,
      note: `${Number(option?.slots || 0)} slots available${Number(option?.extrarate || 0) > 0 ? ` • Extra rate: ${formatPeso(option?.extrarate)}` : ""}`,
    }))
    : modalContent.availableDates

  const defaultDate = pkg.packageSpecificDate[0]?.startdaterange
    ? new Date(pkg.packageSpecificDate[0].startdaterange)
    : new Date(modalContent.dateDetails.startingDate)

  const defaultAirline = pkg.packageAirlines[0] || modalContent.customize.airline
  const defaultHotel = pkg.packageHotels[0] || modalContent.customize.hotel

  const [activeTab, setActiveTab] = useState("itinerary")
  const [activeModal, setActiveModal] = useState(null)

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    defaultDate.toISOString().slice(0, 10)
  )
  const [selectedDate, setSelectedDate] = useState(() =>
    defaultDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  )
  const [availableDateId, setAvailableDateId] = useState(
    () => availableDates[0]?.range ?? "March 18, 2026"
  )
  const [allInLand, setAllInLand] = useState("all-in")
  const [fixedCustom, setFixedCustom] = useState("fixed")
  const [soloGrouped, setSoloGrouped] = useState("solo")
  const [travelers, setTravelers] = useState(defaultTravelers)
  const [airline, setAirline] = useState(() => defaultAirline)
  const [hotel, setHotel] = useState(() => defaultHotel)
  const [addons, setAddons] = useState(["addon-1"])
  const [tours, setTours] = useState(["tour-1"])
  const [selectedOption, setSelectedOption] = useState('')
  const [registration, setRegistration] = useState({
    fullName: "",
    email: "",
    phone: "",
    passportNumber: "",
  })
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const [arrangementType, setArrangementType] = useState("")
  const [quotationNotes, setQuotationNotes] = useState("")
  const [passportUpload, setPassportUpload] = useState({
    passportFileName: "",
    passportFileUrl: "",
  })
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false)
  const [approvalAction, setApprovalAction] = useState("booking")
  const [approvalMessage, setApprovalMessage] = useState("Booking Successful")
  const [latestBooking, setLatestBooking] = useState(null)
  const [isQuotationSuccessVisible, setQuotationSuccessVisible] = useState(false)
  const [hasHandledPaymentCallback, setHasHandledPaymentCallback] = useState(false)
  const packageDays = useMemo(() => {
    const parsed = Number(pkg.packageDuration || toNumber(pkg.duration))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }, [pkg.packageDuration, pkg.duration])
  const itineraryDayLabels = useMemo(
    () => Array.from({ length: packageDays }, (_, index) => `Day ${index + 1}`),
    [packageDays]
  )
  const [quotationTravelers, setQuotationTravelers] = useState(1)
  const [quotationTravelersInput, setQuotationTravelersInput] = useState("1")
  const [quotationBudgetMin, setQuotationBudgetMin] = useState(10000)
  const [quotationBudgetMax, setQuotationBudgetMax] = useState(60000)
  const [quotationItineraryNotes, setQuotationItineraryNotes] = useState({})
  const [quotationAdditionalComments, setQuotationAdditionalComments] = useState("")
  const [quotationSubmitError, setQuotationSubmitError] = useState("")
  const [isAirlineDropdownOpen, setIsAirlineDropdownOpen] = useState(false)
  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false)
  const [invoicePdfUrl, setInvoicePdfUrl] = useState("")
  const [hasAutoOpenedInvoicePdf, setHasAutoOpenedInvoicePdf] = useState(false)
  const totalTravelersForInvoice = travelers.adult + travelers.child + travelers.infant + travelers.senior

  const airlineChoices = useMemo(() => {
    const source = Array.isArray(pkg.packageAirlines) ? pkg.packageAirlines : []
    const unique = [...new Set(source.filter(Boolean))]
    if (defaultAirline && !unique.includes(defaultAirline)) {
      unique.push(defaultAirline)
    }
    return unique.length ? unique : ["NONE"]
  }, [defaultAirline, pkg.packageAirlines])

  const hotelChoices = useMemo(() => {
    const source = Array.isArray(pkg.packageHotels) ? pkg.packageHotels : []
    const unique = [...new Set(source.filter(Boolean))]
    if (defaultHotel && !unique.includes(defaultHotel)) {
      unique.push(defaultHotel)
    }
    return unique.length ? unique : ["NONE"]
  }, [defaultHotel, pkg.packageHotels])

  const invoiceData = useMemo(() => {
    const travelerCount = totalTravelersForInvoice || 1
    const subtotal = (Number(pkg.packagePricePerPax) || 0) * travelerCount
    const tax = subtotal * 0.12
    const totalWithTax = subtotal + tax
    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(issueDate.getDate() + 14)

    return {
      company: {
        name: "M&RC Travel and Tours",
        address: "Paranaque City, Metro Manila, Philippines",
        email: "info@mrc-travel.com",
        phone: "+63 2 555 1234",
      },
      invoice: {
        number: `INV-${String(pkg?.id || "").replace(/[^A-Z0-9-]/gi, "").slice(-8).toUpperCase() || "00000000"}`,
        issueDate: issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        dueDate: dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        status: "Unpaid",
      },
      customer: {
        name: registration.fullName || user?.username || "Customer",
        email: registration.email || "N/A",
        phone: registration.phone || "N/A",
      },
      booking: {
        reference: "To be generated after payment",
        packageName: pkg.title,
        travelDates: pkg.isInternational ? availableDateId : selectedDate,
        travelers: travelerCount,
      },
      items: [
        {
          description: "Tour Package",
          qty: travelerCount,
          rate: travelerCount > 0 ? subtotal / travelerCount : subtotal,
          amount: subtotal,
        },
      ],
      subtotal,
      tax,
      totalWithTax,
    }
  }, [availableDateId, pkg.id, pkg.isInternational, pkg.packagePricePerPax, pkg.title, registration.email, registration.fullName, registration.phone, selectedDate, totalTravelersForInvoice, user?.username])

  useEffect(() => {
    if (activeModal !== "invoice") return

    try {
      const { blob, dataUri } = generateBookingInvoicePdf(invoiceData)

      if (Platform.OS === "web") {
        const objectUrl = URL.createObjectURL(blob)
        setInvoicePdfUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
      }

      setInvoicePdfUrl(dataUri)
    } catch (_error) {
      setInvoicePdfUrl("")
    }
  }, [activeModal, invoiceData])

  useEffect(() => {
    if (activeModal !== "invoice") {
      setHasAutoOpenedInvoicePdf(false)
      return
    }

    if (!invoicePdfUrl || hasAutoOpenedInvoicePdf) return

    Linking.openURL(invoicePdfUrl)
      .catch(() => {})
      .finally(() => setHasAutoOpenedInvoicePdf(true))
  }, [activeModal, hasAutoOpenedInvoicePdf, invoicePdfUrl])

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return
    if (hasHandledPaymentCallback) return

    const search = new URLSearchParams(window.location.search || "")
    const bookingStatus = search.get("booking") || ""
    const checkoutToken = search.get("checkoutToken") || ""

    if (!bookingStatus) return

    const clearCallbackParams = () => {
      window.history.replaceState({}, "", "/packagedetails")
    }

    if (bookingStatus === "cancel") {
      window.localStorage.removeItem(pendingBookingStorageKey)
      setHasHandledPaymentCallback(true)
      clearCallbackParams()
      Alert.alert("Payment cancelled", "Your PayMongo payment was cancelled.")
      return
    }

    if (bookingStatus !== "success" || !checkoutToken) return

    const rawPending = window.localStorage.getItem(pendingBookingStorageKey)
    if (!rawPending) {
      setHasHandledPaymentCallback(true)
      clearCallbackParams()
      Alert.alert("Payment received", "No pending booking data was found. Please contact support.")
      return
    }

    let pending
    try {
      pending = JSON.parse(rawPending)
    } catch (_error) {
      window.localStorage.removeItem(pendingBookingStorageKey)
      setHasHandledPaymentCallback(true)
      clearCallbackParams()
      Alert.alert("Payment received", "Booking data is invalid. Please contact support.")
      return
    }

    if (pending?.checkoutToken !== checkoutToken) {
      setHasHandledPaymentCallback(true)
      clearCallbackParams()
      Alert.alert("Payment received", "Payment callback did not match pending booking data.")
      return
    }

    const finalizeAfterSuccess = async () => {
      setIsSubmittingPayment(true)
      try {
        const actingUserId = pending?.userId || user?._id
        if (!actingUserId) {
          throw new Error("User ID is required")
        }

        const bookingRes = await api.post(
          "/booking/create-booking",
          {
            packageId: pending.packageId,
            bookingDetails: pending.bookingDetails,
            checkoutToken,
          },
          withUserHeader(actingUserId)
        )

        await api.post(
          "/transaction/create-transaction",
          {
            bookingId: bookingRes.data._id,
            amount: pending.totalPrice,
            method: pending.paymentMethod,
            status: "Paid",
            packageName: pending.packageName,
          },
          withUserHeader(actingUserId)
        )

        setApprovalAction("booking")
        setApprovalMessage("Booking Successful")
        setLatestBooking(bookingRes.data)
        setActiveModal("approval")
      } catch (error) {
        Alert.alert("Payment received", error.response?.data?.message || "Unable to finalize booking. Please contact support.")
      } finally {
        window.localStorage.removeItem(pendingBookingStorageKey)
        setHasHandledPaymentCallback(true)
        clearCallbackParams()
        setIsSubmittingPayment(false)
      }
    }

    finalizeAfterSuccess()
  }, [hasHandledPaymentCallback, user?._id])

  const getModalTitle = () => {
    if (activeModal === "arrangement") return "Choose Package Type"
    if (activeModal === "quotation") return pkg.isInternational ? "Package Quotation" : "Domestic Package Quotation"
    if (activeModal === "available") return "Available Dates"
    if (activeModal === "solo") return "SOLO OR GROUPED"
    if (activeModal === "travelers") return "Travelers"
    if (activeModal === "summary") return "Booking Summary"
    if (activeModal === "registration") return "Booking Registration"
    if (activeModal === "passport") return "Upload Passport"
    if (activeModal === "invoice") return "Booking Invoice"
    if (activeModal === "payment") return "Payment"
    if (activeModal === "approval") return "Confirmation"
    return ""
  }

  const startAvailability = () => {
    const initialTravelers = totalTravelers || 1
    setArrangementType("")
    setQuotationNotes("")
    setQuotationTravelers(initialTravelers)
    setQuotationTravelersInput(String(initialTravelers))
    setQuotationBudgetMin(10000)
    setQuotationBudgetMax(60000)
    setQuotationItineraryNotes({})
    setQuotationAdditionalComments("")
    setQuotationSubmitError("")
    setSelectedOption("")
    setHasAgreedToTerms(false)
    setPassportUpload({ passportFileName: "", passportFileUrl: "" })
    setLatestBooking(null)
    setActiveModal("arrangement")
  }

  const selectPassportFile = () => {
    if (Platform.OS !== "web" || typeof window === "undefined" || !window.document) {
      Alert.alert("Unsupported", "Passport upload is currently available on web.")
      return
    }

    const input = window.document.createElement("input")
    input.type = "file"
    input.accept = "image/*,.pdf"

    input.onchange = () => {
      const selectedFile = input.files?.[0]
      if (!selectedFile) return

      const reader = new window.FileReader()

      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : ""
        setPassportUpload({
          passportFileName: selectedFile.name,
          passportFileUrl: dataUrl,
        })
      }

      reader.onerror = () => {
        Alert.alert("Upload failed", "Unable to read the selected file. Please try again.")
      }

      reader.readAsDataURL(selectedFile)
    }

    input.click()
  }

  const submitQuotationRequest = async () => {
    setQuotationSubmitError("")

    if (!user?._id) {
      setQuotationSubmitError("Please login first to request a quotation.")
      Alert.alert("Login required", "Please login first to request a quotation.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("login"),
        },
      ])
      return
    }

    setIsSubmittingQuotation(true)

    try {
      const parsedTravelers = Number((quotationTravelersInput || "").replace(/[^0-9]/g, ""))
      const finalTravelers = Number.isFinite(parsedTravelers) ? parsedTravelers : 0

      if (!finalTravelers || finalTravelers < 1) {
        setQuotationSubmitError("Please enter the number of travelers.")
        Alert.alert("Validation", "Please enter the number of travelers.")
        setIsSubmittingQuotation(false)
        return
      }

      setQuotationTravelers(finalTravelers)
      setQuotationTravelersInput(String(finalTravelers))

      if (quotationBudgetMin <= 0 || quotationBudgetMax <= 0 || quotationBudgetMax < quotationBudgetMin) {
        setQuotationSubmitError("Please enter a valid budget range.")
        Alert.alert("Validation", "Please enter a valid budget range.")
        setIsSubmittingQuotation(false)
        return
      }

      if (!arrangementType) {
        setQuotationSubmitError("Please choose a package type first.")
        Alert.alert("Validation", "Please choose a package type first.")
        setIsSubmittingQuotation(false)
        return
      }

      const resolvedPackageId = String(pkg?.id || pkg?._id || pkg?.packageId || "").trim()
      const resolvedPackageName = String(pkg?.title || pkg?.packageName || "").trim()

      if (!resolvedPackageId || !resolvedPackageName) {
        setQuotationSubmitError("Package details are incomplete. Please reopen this package.")
        Alert.alert("Validation", "Package details are incomplete. Please reopen this package.")
        setIsSubmittingQuotation(false)
        return
      }

      const preferredAirlines = (airline || "").trim() || "NONE"
      const preferredHotels = (hotel || "").trim() || "NONE"

      const itineraryNotesPayload = itineraryDayLabels.map((label, index) => {
        const noteValue = (quotationItineraryNotes[index] || "").trim()
        return noteValue || "NONE"
      })

      await api.post(
        "/quotation/create-quotation",
        {
          packageId: resolvedPackageId,
          packageName: resolvedPackageName,
          travelDetails: {
            arrangementType,
            travelDate: pkg.isInternational ? availableDateId : selectedDate,
            travelers: finalTravelers,
            preferredAirlines,
            preferredHotels,
            budgetRange: [quotationBudgetMin, quotationBudgetMax],
            itineraryNotes: itineraryNotesPayload,
            fixedItinerary: itineraryDayLabels,
            additionalComments: quotationAdditionalComments,
            notes: quotationNotes,
          },
        },
        withUserHeader(user._id)
      )

      setApprovalAction("quotation")
      setApprovalMessage("Quotation submitted. Admin will receive your request.")
      setActiveModal(null)
      setQuotationSuccessVisible(true)
    } catch (error) {
      const serverMessage = error.response?.data?.message
      const networkMessage = error.message
      setQuotationSubmitError(serverMessage || networkMessage || "Unable to submit quotation request")
      Alert.alert(
        "Error",
        serverMessage || networkMessage || "Unable to submit quotation request"
      )
    } finally {
      setIsSubmittingQuotation(false)
    }
  }

  const processBookingPayment = async () => {
    if (isSubmittingPayment) return

    if (!user?._id) {
      Alert.alert("Login required", "Please login first to continue booking.")
      return
    }

    const resolvedPaymentMethod = selectedOption || "paymongo"

    const numericPricePerPax = Number(pkg.packagePricePerPax) || toNumber(pkg.price) || 0
    const travelerCount = totalTravelers || 1
    const totalPrice = numericPricePerPax * travelerCount
    const travelDate = pkg.isInternational ? availableDateId : selectedDate

    const bookingDetails = {
      packageName: pkg.title,
      travelDate,
      arrangement: arrangementType,
      groupType: soloGrouped,
      travelers: travelerCount,
      travelerBreakdown: travelers,
      preferredAirlines: airline,
      preferredHotels: hotel,
      registration,
      passportUpload,
      paymentMethod: resolvedPaymentMethod,
      pricePerPax: numericPricePerPax,
      totalPrice,
      paidAmount: totalPrice,
    }

    setIsSubmittingPayment(true)

    try {
      const tokenRes = await api.post(
        "/payment/create-checkout-token",
        { totalPrice },
        withUserHeader(user._id)
      )

      const checkoutToken = tokenRes.data?.token

      const sessionRes = await api.post(
        "/payment/create-checkout-session",
        {
          checkoutToken,
          totalPrice,
          packageName: pkg.title,
          travelersCount: travelerCount,
          successUrl:
            Platform.OS === "web" && typeof window !== "undefined"
              ? `${window.location.origin}/packagedetails?booking=success&checkoutToken=${encodeURIComponent(checkoutToken || "")}`
              : "https://example.com/payment-success",
          cancelUrl:
            Platform.OS === "web" && typeof window !== "undefined"
              ? `${window.location.origin}/packagedetails?booking=cancel`
              : "https://example.com/payment-cancel",
        },
        withUserHeader(user._id)
      )

      const checkoutUrl = sessionRes.data?.data?.attributes?.checkout_url
      if (!checkoutUrl) {
        setIsSubmittingPayment(false)
        Alert.alert("Error", "Unable to redirect to PayMongo checkout.")
        return
      }

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.setItem(
          pendingBookingStorageKey,
          JSON.stringify({
            userId: user._id,
            packageId: pkg.id,
            bookingDetails,
            checkoutToken,
            totalPrice,
            paymentMethod: resolvedPaymentMethod,
            packageName: pkg.title,
          })
        )

        window.location.href = checkoutUrl
        return
      }

      await Linking.openURL(checkoutUrl)
      setIsSubmittingPayment(false)
    } catch (error) {
      setIsSubmittingPayment(false)
      Alert.alert("Error", error.response?.data?.message || "Unable to proceed to payment")
    }
  }

  const nextModal = () => {
    if (activeModal === "arrangement") {
      if (!arrangementType) {
        Alert.alert("Selection required", "Please choose a package type.")
        return
      }

      if (!pkg.isInternational) {
        setActiveModal("quotation")
        return
      }

      if (arrangementType === "all-in") {
        setActiveModal("available")
        return
      }

      setActiveModal("quotation")
      return
    }

    if (activeModal === "quotation") {
      if (isSubmittingQuotation) return
      submitQuotationRequest()
      return
    }

    if (activeModal === "available") {
      setActiveModal("solo")
      return
    }

    if (activeModal === "solo") {
      if (soloGrouped === "solo") {
        setTravelers(defaultTravelers)
        setActiveModal("summary")
      } else {
        setActiveModal("travelers")
      }
      return
    }

    if (activeModal === "travelers") {
      setActiveModal("summary")
      return
    }

    if (activeModal === "summary") {
      setActiveModal("registration")
      return
    }

    if (activeModal === "registration") {
      if (!pkg.isInternational && (!registration.fullName || !registration.email || !registration.phone)) {
        Alert.alert("Missing details", "Please complete your registration details.")
        return
      }

      if (!hasAgreedToTerms) {
        Alert.alert("Agreement required", "Please agree to all terms and conditions first.")
        return
      }

      if (pkg.isInternational && arrangementType === "all-in") {
        setActiveModal("passport")
        return
      }

      setActiveModal("invoice")
      return
    }

    if (activeModal === "passport") {
      if (!passportUpload.passportFileUrl) {
        Alert.alert("Passport required", "Please upload your passport file.")
        return
      }
      setActiveModal("invoice")
      return
    }

    if (activeModal === "invoice") {
      processBookingPayment()
      return
    }

    if (activeModal === "payment") {
      processBookingPayment()
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

    if (activeModal === "payment") {
      setActiveModal("invoice")
      return
    }

    if (activeModal === "invoice") {
      if (pkg.isInternational && arrangementType === "all-in") {
        setActiveModal("passport")
        return
      }
      setActiveModal("registration")
      return
    }

    if (activeModal === "passport") {
      setActiveModal("registration")
      return
    }

    if (activeModal === "registration") {
      setActiveModal("summary")
      return
    }

    if (activeModal === "summary") {
      setActiveModal(soloGrouped === "solo" ? "solo" : "travelers")
      return
    }

    if (activeModal === "travelers") {
      setActiveModal("solo")
      return
    }

    if (activeModal === "solo") {
      setActiveModal("available")
      return
    }

    if (activeModal === "available") {
      setActiveModal("arrangement")
      return
    }

    if (activeModal === "quotation") {
      setActiveModal("arrangement")
      return
    }

    if (activeModal === "arrangement") {
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
                  {pkg.packageItineraries.length ? (
                    pkg.packageItineraries.map((line, index) => (
                      <View key={`itinerary-${index}`} style={{ marginBottom: 8 }}>
                        <Text style={DestinationStyles.sectionTitle}>DAY {index + 1}</Text>
                        <Text style={DestinationStyles.sectionText}>{line}</Text>
                      </View>
                    ))
                  ) : (
                    <>
                      <Text style={DestinationStyles.sectionTitle}>DAY 1</Text>
                      <Text style={DestinationStyles.sectionText}>
                        Arrive at the Destination and Check-in to the Hotel
                      </Text>
                    </>
                  )}
            </>
          )}
          {activeTab === "inclusions" && (
            <>
              <Text style={DestinationStyles.sectionTitle}>INCLUSIONS AND EXCLUSIONS</Text>
              <Text style={DestinationStyles.sectionText}>
                Inclusions: {pkg.packageInclusions.length ? pkg.packageInclusions.join(", ") : "Breakfast Buffet"}{"\n"}
                Exclusions: {pkg.packageExclusions.length ? pkg.packageExclusions.join(", ") : "Tips for the Tour Guide"}
              </Text>
            </>
          )}
          {activeTab === "terms" && (
            <>
              <Text style={DestinationStyles.sectionTitle}>TERMS AND CONDITIONS</Text>
              <Text style={DestinationStyles.sectionText}>
                {pkg.packageTermsConditions.length
                  ? pkg.packageTermsConditions.join("\n")
                  : "No late cancellations"}
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

            <ScrollView
              style={DestinationStyles.modalBody}
              contentContainerStyle={DestinationStyles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {activeModal === "arrangement" && (
                <>
                  {pkg.isInternational ? (
                    <>
                      <SelectableCard
                        selected={arrangementType === "all-in"}
                        onPress={() => setArrangementType("all-in")}
                        image={modalContent.allIn.image}
                        title="All in Package"
                        text="Proceed directly to available dates and booking steps."
                      />
                      <SelectableCard
                        selected={arrangementType === "custom-all-in"}
                        onPress={() => setArrangementType("custom-all-in")}
                        image={modalContent.custom.image}
                        title="Customized All in Package"
                        text="Send a quotation request for a customized all-in package."
                      />
                      <SelectableCard
                        selected={arrangementType === "custom-land"}
                        onPress={() => setArrangementType("custom-land")}
                        image={modalContent.land.image}
                        title="Customized Land Arrangement"
                        text="Send a quotation request for a customized land arrangement."
                      />
                    </>
                  ) : (
                    <>
                      <SelectableCard
                        selected={arrangementType === "custom-all-in"}
                        onPress={() => setArrangementType("custom-all-in")}
                        image={modalContent.custom.image}
                        title="Customized All in Package"
                        text="Send a domestic package quotation request to admin."
                      />
                      <SelectableCard
                        selected={arrangementType === "custom-land"}
                        onPress={() => setArrangementType("custom-land")}
                        image={modalContent.land.image}
                        title="Customized Land Arrangement"
                        text="Send a domestic package quotation request to admin."
                      />
                    </>
                  )}
                </>
              )}

              {activeModal === "quotation" && (
                <View style={DestinationStyles.modalBox}>
                  <Text style={DestinationStyles.quotationIntro}>
                    Kindly input your preferences and requests so that we can tailor your customized package.
                  </Text>

                  <View style={DestinationStyles.quotationRow}>
                    <View style={DestinationStyles.quotationHalf}>
                      <Text style={DestinationStyles.quotationLabel}>NUMBER OF TRAVELERS</Text>
                      <TextInput
                        style={DestinationStyles.quotationInput}
                        keyboardType="number-pad"
                        value={quotationTravelersInput}
                        onChangeText={(value) => {
                          const digitsOnly = value.replace(/[^0-9]/g, "")
                          setQuotationTravelersInput(digitsOnly)
                          if (digitsOnly) {
                            setQuotationTravelers(Number(digitsOnly))
                          }
                        }}
                      />
                    </View>
                    <View style={DestinationStyles.quotationHalf}>
                      <Text style={DestinationStyles.quotationLabel}>PREFERRED AIRLINES</Text>
                      {arrangementType === "custom-all-in" ? (
                        <View>
                          <TouchableOpacity
                            style={DestinationStyles.quotationDropdownTrigger}
                            onPress={() => {
                              setIsAirlineDropdownOpen((prev) => !prev)
                              setIsHotelDropdownOpen(false)
                            }}
                          >
                            <Text style={DestinationStyles.quotationDropdownText}>{airline || "Select preferred airline"}</Text>
                            <Ionicons name={isAirlineDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#305797" />
                          </TouchableOpacity>

                          {isAirlineDropdownOpen && (
                            <View style={DestinationStyles.quotationDropdownMenu}>
                              {airlineChoices.map((option) => (
                                <TouchableOpacity
                                  key={`airline-${option}`}
                                  style={DestinationStyles.quotationDropdownItem}
                                  onPress={() => {
                                    setAirline(option)
                                    setIsAirlineDropdownOpen(false)
                                  }}
                                >
                                  <Text style={DestinationStyles.quotationDropdownItemText}>{option}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      ) : (
                        <TextInput
                          style={DestinationStyles.quotationInput}
                          placeholder="Provide airline preferences"
                          value={airline}
                          onChangeText={setAirline}
                        />
                      )}
                    </View>
                  </View>

                  <View style={DestinationStyles.quotationSectionGap}>
                    <Text style={DestinationStyles.quotationLabel}>PREFERRED HOTELS</Text>
                    {arrangementType === "custom-all-in" ? (
                      <View>
                        <TouchableOpacity
                          style={DestinationStyles.quotationDropdownTrigger}
                          onPress={() => {
                            setIsHotelDropdownOpen((prev) => !prev)
                            setIsAirlineDropdownOpen(false)
                          }}
                        >
                          <Text style={DestinationStyles.quotationDropdownText}>{hotel || "Select preferred hotel"}</Text>
                          <Ionicons name={isHotelDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#305797" />
                        </TouchableOpacity>

                        {isHotelDropdownOpen && (
                          <View style={DestinationStyles.quotationDropdownMenu}>
                            {hotelChoices.map((option) => (
                              <TouchableOpacity
                                key={`hotel-${option}`}
                                style={DestinationStyles.quotationDropdownItem}
                                onPress={() => {
                                  setHotel(option)
                                  setIsHotelDropdownOpen(false)
                                }}
                              >
                                <Text style={DestinationStyles.quotationDropdownItemText}>{option}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    ) : (
                      <TextInput
                        style={DestinationStyles.quotationInput}
                        placeholder="Provide hotel preferences"
                        value={hotel}
                        onChangeText={setHotel}
                      />
                    )}
                  </View>

                  <View style={DestinationStyles.quotationSectionGap}>
                    <Text style={DestinationStyles.quotationLabel}>BUDGET RANGE (PER PAX)</Text>
                    <View style={DestinationStyles.quotationBudgetValues}>
                      <Text style={DestinationStyles.quotationBudgetValue}>₱ {quotationBudgetMin.toLocaleString()}</Text>
                      <Text style={DestinationStyles.quotationBudgetValue}>₱ {quotationBudgetMax.toLocaleString()}</Text>
                    </View>
                    <View style={DestinationStyles.quotationRow}>
                      <TextInput
                        style={[DestinationStyles.quotationInput, DestinationStyles.quotationHalf]}
                        keyboardType="number-pad"
                        placeholder="Min"
                        value={String(quotationBudgetMin)}
                        onChangeText={(value) => setQuotationBudgetMin(Number(value.replace(/[^0-9]/g, "")) || 0)}
                      />
                      <TextInput
                        style={[DestinationStyles.quotationInput, DestinationStyles.quotationHalf]}
                        keyboardType="number-pad"
                        placeholder="Max"
                        value={String(quotationBudgetMax)}
                        onChangeText={(value) => setQuotationBudgetMax(Number(value.replace(/[^0-9]/g, "")) || 0)}
                      />
                    </View>
                  </View>

                  <View style={DestinationStyles.quotationItineraryCard}>
                    <Text style={DestinationStyles.modalSubTitle}>Fixed Itinerary</Text>
                    <View style={DestinationStyles.quotationItineraryGrid}>
                      {itineraryDayLabels.map((label, index) => (
                        <View key={label} style={DestinationStyles.quotationItineraryItem}>
                          <Text style={DestinationStyles.quotationItineraryDay}>{label}</Text>
                          <Text style={DestinationStyles.summaryText}>• {index + 1}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <Text style={DestinationStyles.modalSubTitle}>Itinerary Notes</Text>
                  <View style={DestinationStyles.quotationNotesGrid}>
                    {itineraryDayLabels.map((label, index) => (
                      <View
                        key={`note-${label}`}
                        style={itineraryDayLabels.length === 1 ? DestinationStyles.quotationNotesItemFull : DestinationStyles.quotationNotesItem}
                      >
                        <Text style={DestinationStyles.modalSubTitle}>{label.toUpperCase()}</Text>
                        <TextInput
                          style={DestinationStyles.quotationTextArea}
                          placeholder={`Notes for ${label}. Type 'NONE' if no changes`}
                          multiline
                          value={quotationItineraryNotes[index] || ""}
                          onChangeText={(value) =>
                            setQuotationItineraryNotes((prev) => ({
                              ...prev,
                              [index]: value,
                            }))
                          }
                        />
                      </View>
                    ))}
                  </View>

                  <View style={DestinationStyles.quotationSectionGap}>
                    <Text style={DestinationStyles.quotationLabel}>ADDITIONAL COMMENTS</Text>
                    <TextInput
                      style={DestinationStyles.quotationTextArea}
                      placeholder="Anything else we should know?"
                      multiline
                      value={quotationAdditionalComments}
                      onChangeText={setQuotationAdditionalComments}
                    />
                  </View>
                </View>
              )}

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
                  {availableDates.map((option) => (
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
                      setAirline(defaultAirline)
                      setHotel(defaultHotel)
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
                    Date: {pkg.isInternational ? availableDateId : selectedDate}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Arrangement: {arrangementType}
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
                    Estimated Total: ₱{((Number(pkg.packagePricePerPax) || 0) * (totalTravelers || 1)).toLocaleString()}
                  </Text>
                  <Text style={DestinationStyles.summaryWarning}>
                    MUST READ! Please double check everything before confirming.
                  </Text>
                </View>
              )}

              {activeModal === "registration" && (
                <View style={DestinationStyles.modalBox}>
                  {!pkg.isInternational ? (
                    <>
                      <TextInput
                        style={DestinationStyles.reviewInput}
                        placeholder="Full Name"
                        value={registration.fullName}
                        onChangeText={(value) => setRegistration((prev) => ({ ...prev, fullName: value }))}
                      />
                      <TextInput
                        style={DestinationStyles.reviewInput}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={registration.email}
                        onChangeText={(value) => setRegistration((prev) => ({ ...prev, email: value }))}
                      />
                      <TextInput
                        style={DestinationStyles.reviewInput}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={registration.phone}
                        onChangeText={(value) => setRegistration((prev) => ({ ...prev, phone: value }))}
                      />
                      <TextInput
                        style={DestinationStyles.reviewInput}
                        placeholder="Passport Number (optional)"
                        value={registration.passportNumber}
                        onChangeText={(value) => setRegistration((prev) => ({ ...prev, passportNumber: value }))}
                      />

                      <Text style={DestinationStyles.summaryText}>
                        Terms and Conditions: By booking this package, you agree to follow all rules and regulations set forth by our service.
                      </Text>
                      <TouchableOpacity
                        style={DestinationStyles.checkboxRow}
                        onPress={() => setHasAgreedToTerms((prev) => !prev)}
                      >
                        <View style={DestinationStyles.checkbox}>
                          {hasAgreedToTerms && <View style={DestinationStyles.checkboxFill} />}
                        </View>
                        <Text style={DestinationStyles.checkboxLabel}>I have read and agree to all terms and conditions</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={DestinationStyles.termsCard}>
                        <Text style={DestinationStyles.termsTitle}>Terms and Conditions</Text>
                        <Text style={DestinationStyles.termsText}>
                          By booking this package, you agree to follow all rules and regulations set forth by our service. Please read carefully.
                        </Text>
                      </View>

                      <View style={DestinationStyles.termsCard}>
                        <Text style={DestinationStyles.termsTitle}>Cancellation Policy</Text>
                        <Text style={DestinationStyles.termsText}>
                          Cancellations within 24 hours of booking receive a full refund. Cancellations after that are non-refundable.
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={DestinationStyles.checkboxRow}
                        onPress={() => setHasAgreedToTerms((prev) => !prev)}
                      >
                        <View style={DestinationStyles.checkbox}>
                          {hasAgreedToTerms && <View style={DestinationStyles.checkboxFill} />}
                        </View>
                        <Text style={DestinationStyles.checkboxLabel}>I have read and agree to all terms and conditions</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {activeModal === "passport" && (
                <View style={DestinationStyles.modalBox}>
                  <Text style={DestinationStyles.uploadPassportIntro}>Please upload a clear image of your passport bio page.</Text>

                  <View style={DestinationStyles.uploadPassportOuter}>
                    <TouchableOpacity style={DestinationStyles.uploadPassportInner} onPress={selectPassportFile}>
                      <Ionicons name="archive-outline" size={52} color="#305797" />
                      <Text style={DestinationStyles.uploadPassportTitle}>Drag & drop your file here, or click to select</Text>
                      <Text style={DestinationStyles.uploadPassportHint}>Only 1 file is allowed.</Text>
                      {!!passportUpload.passportFileName && (
                        <Text style={DestinationStyles.uploadPassportFileName}>{passportUpload.passportFileName}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeModal === "invoice" && (
                <View style={DestinationStyles.modalBox}>
                  <Text style={DestinationStyles.summaryText}>Reference: To be generated after payment</Text>
                  <Text style={DestinationStyles.summaryText}>Package: {pkg.title}</Text>
                  <Text style={DestinationStyles.summaryText}>
                    Travel Date: {pkg.isInternational ? availableDateId : selectedDate}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>Traveler Count: {totalTravelers || 1}</Text>
                  <Text style={DestinationStyles.summaryText}>
                    Price Per Pax: ₱{(Number(pkg.packagePricePerPax) || 0).toLocaleString()}
                  </Text>
                  <Text style={DestinationStyles.summaryText}>
                    Total: ₱{((Number(pkg.packagePricePerPax) || 0) * (totalTravelers || 1)).toLocaleString()}
                  </Text>

                  {!!invoicePdfUrl && (
                    <TouchableOpacity
                      style={[DestinationStyles.primaryButton, { marginTop: 12, alignSelf: "flex-start" }]}
                      onPress={() => Linking.openURL(invoicePdfUrl)}
                    >
                      <Text style={DestinationStyles.primaryText}>Open Generated Invoice PDF</Text>
                    </TouchableOpacity>
                  )}
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
                      ₱{((Number(pkg.packagePricePerPax) || 0) * (totalTravelers || 1)).toLocaleString()}
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
                  <Text style={DestinationStyles.approvalText}>{approvalMessage}</Text>
                </View>
              )}
            </ScrollView>

            {activeModal !== "approval" && (
              <View style={DestinationStyles.modalButtonRow}>
                {(() => {
                  const isProceedDisabled =
                    (activeModal === "passport" && !passportUpload.passportFileUrl) ||
                    isSubmittingQuotation ||
                    isSubmittingPayment

                  return (
                <TouchableOpacity
                  style={[DestinationStyles.primaryButton, isProceedDisabled && DestinationStyles.primaryButtonDisabled]}
                  onPress={activeModal === "quotation" ? submitQuotationRequest : nextModal}
                  disabled={isProceedDisabled}
                >
                  <Text style={DestinationStyles.primaryText}>
                    {isSubmittingQuotation || isSubmittingPayment
                      ? "Processing..."
                      : activeModal === "quotation"
                        ? "Submit Request"
                        : "Proceed"}
                  </Text>
                </TouchableOpacity>
                  )
                })()}
                <TouchableOpacity style={DestinationStyles.dangerButton} onPress={activeModal === "passport" ? closeModal : prevModal}>
                  <Text style={DestinationStyles.primaryText}>
                    {activeModal === "quotation" || activeModal === "passport" ? "Cancel" : "Back"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {activeModal === "quotation" && !!quotationSubmitError && (
              <Text style={{ color: "#c62828", fontSize: 12, marginTop: 6 }}>{quotationSubmitError}</Text>
            )}

            {activeModal === "approval" && (
              <View style={DestinationStyles.modalButtonRow}>
                <TouchableOpacity
                  style={DestinationStyles.primaryButton}
                  onPress={() => {
                    closeModal()
                    if (approvalAction === "quotation") {
                      navigation.navigate("userquotations")
                      return
                    }

                    if (latestBooking) {
                      navigation.navigate("bookinginvoice", { booking: latestBooking })
                      return
                    }
                    navigation.navigate("userbookings")
                  }}
                >
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

      <Modal
        transparent
        animationType='fade'
        visible={isQuotationSuccessVisible}
        onRequestClose={() => setQuotationSuccessVisible(false)}
      >
        <View style={ModalStyle.modalOverlay}>
          <View style={[ModalStyle.modalBox, { width: 330, alignItems: 'stretch', padding: 16 }]}> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[ModalStyle.modalTitle, { marginBottom: 6, fontSize: 20 }]}>Package Quotation Submitted</Text>
              <TouchableOpacity onPress={() => setQuotationSuccessVisible(false)}>
                <Ionicons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={[ModalStyle.modalText, { textAlign: 'left', marginBottom: 14, fontSize: 12 }]}>Your package quotation request has been submitted successfully. Please wait for your quotation to be generated.</Text>

            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={[ModalStyle.modalButton, { width: 52, height: 34, paddingVertical: 0, borderRadius: 8 }]}
                onPress={() => {
                  setQuotationSuccessVisible(false)
                  setActiveModal(null)
                }}
              >
                <Text style={[ModalStyle.modalButtonText, { fontSize: 13 }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  )
}

const pendingBookingStorageKey = "capsapp_pending_package_booking"