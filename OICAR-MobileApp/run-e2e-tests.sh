#!/bin/bash

# 🧪 OICAR Mobile E2E Test Runner
# Runs Maestro tests with proper setup and reporting

set -e  # Exit on error

echo "🚀 OICAR Mobile E2E Test Suite"
echo "=============================="

# Configuration
MAESTRO_PATH="$HOME/.maestro/bin/maestro"
TEST_DIR=".maestro"
RESULTS_DIR="test-results"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Maestro is installed
    if [ ! -f "$MAESTRO_PATH" ]; then
        log_error "Maestro not found at $MAESTRO_PATH"
        log_info "Install Maestro: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
        exit 1
    fi
    
    # Check if test directory exists
    if [ ! -d "$TEST_DIR" ]; then
        log_error "Test directory $TEST_DIR not found"
        exit 1
    fi
    
    # Check if package.json exists (mobile app directory)
    if [ ! -f "package.json" ]; then
        log_error "Not in mobile app directory. Please run from OICAR-MobileApp/"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup test environment
setup_environment() {
    log_info "Setting up test environment..."
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Add Maestro to PATH for this session
    export PATH="$PATH:$HOME/.maestro/bin"
    
    log_success "Environment setup complete"
}

# Check if app is running
check_app_status() {
    log_info "Checking if mobile app is accessible..."
    
    # Try to get app hierarchy (will fail if app not running)
    if maestro hierarchy > /dev/null 2>&1; then
        log_success "Mobile app is running and accessible"
    else
        log_warning "Mobile app not detected"
        log_info "Please ensure your React Native app is running:"
        log_info "  npm start"
        log_info "  Press 'i' for iOS Simulator or 'a' for Android Emulator"
        
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check API health
check_api_health() {
    log_info "Checking Azure API health..."
    
    API_URL="https://oicar-api-ms1749710600.azurewebsites.net/health"
    
    if curl -s -f "$API_URL" > /dev/null; then
        log_success "Azure API is healthy"
    else
        log_warning "Azure API health check failed"
        log_info "API URL: $API_URL"
        
        read -p "Continue with tests anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Run individual test
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .yaml)
    
    log_info "Running test: $test_name"
    
    local start_time=$(date +%s)
    
    if maestro test "$test_file" --output "$RESULTS_DIR/$test_name" 2>&1 | tee "$RESULTS_DIR/${test_name}_${TIMESTAMP}.log"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_success "✅ $test_name completed in ${duration}s"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_error "❌ $test_name failed after ${duration}s"
        return 1
    fi
}

# Run all tests
run_all_tests() {
    log_info "Starting E2E test execution..."
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    # Define test execution order
    declare -a test_files=(
        "$TEST_DIR/01-registration-flow.yaml"
        "$TEST_DIR/02-login-flow.yaml"
        "$TEST_DIR/03-item-browsing-flow.yaml"
        "$TEST_DIR/04-add-to-cart-flow.yaml"
        "$TEST_DIR/05-complete-purchase-flow.yaml"
        "$TEST_DIR/06-logout-flow.yaml"
    )
    
    echo
    echo "📋 Test Execution Plan:"
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            echo "  - $(basename "$test_file" .yaml)"
            ((total_tests++))
        fi
    done
    echo
    
    # Run tests in sequence
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            if run_test "$test_file"; then
                ((passed_tests++))
            else
                ((failed_tests++))
            fi
            echo
        else
            log_warning "Test file not found: $test_file"
        fi
    done
    
    # Generate summary
    echo "🎯 Test Execution Summary"
    echo "========================"
    echo "Total Tests: $total_tests"
    echo "Passed: $passed_tests"
    echo "Failed: $failed_tests"
    echo "Success Rate: $(( passed_tests * 100 / total_tests ))%"
    echo
    
    if [ $failed_tests -eq 0 ]; then
        log_success "🎉 All tests passed! Your OICAR mobile app is working perfectly."
        echo
        echo "📊 Database Impact:"
        echo "  ✅ Test user accounts created"
        echo "  ✅ Cart operations performed"
        echo "  ✅ Orders placed and recorded"
        echo "  ✅ Authentication logs generated"
        echo
        echo "🔍 Check Azure SQL Database for test data records"
        return 0
    else
        log_error "❌ Some tests failed. Check logs in $RESULTS_DIR/"
        return 1
    fi
}

# Run complete user journey test
run_complete_journey() {
    local test_file="$TEST_DIR/00-complete-user-journey.yaml"
    
    if [ -f "$test_file" ]; then
        log_info "Running complete user journey test..."
        echo "⏱️  This test will take 5-10 minutes"
        echo "🔄 Testing: Registration → Login → Browse → Cart → Purchase → Logout"
        echo
        
        if run_test "$test_file"; then
            log_success "🎉 Complete user journey test passed!"
            echo
            echo "💾 Real data created in Azure SQL Database:"
            echo "  ✅ New user account"
            echo "  ✅ Shopping cart items"
            echo "  ✅ Complete order record"
            echo "  ✅ Authentication sessions"
            return 0
        else
            log_error "❌ Complete user journey test failed"
            return 1
        fi
    else
        log_error "Complete journey test file not found: $test_file"
        return 1
    fi
}

# Main execution
main() {
    local mode=${1:-"all"}
    
    echo "🕐 Started at: $(date)"
    echo
    
    check_prerequisites
    setup_environment
    check_app_status
    check_api_health
    
    echo
    
    case $mode in
        "journey"|"complete")
            run_complete_journey
            ;;
        "all"|"")
            run_all_tests
            ;;
        *)
            log_error "Unknown mode: $mode"
            echo "Usage: $0 [all|journey]"
            echo "  all     - Run all individual tests (default)"
            echo "  journey - Run complete user journey test"
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    echo
    echo "🕐 Completed at: $(date)"
    echo "📁 Results saved in: $RESULTS_DIR/"
    
    exit $exit_code
}

# Show usage if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "🧪 OICAR Mobile E2E Test Runner"
    echo
    echo "Usage: $0 [mode]"
    echo
    echo "Modes:"
    echo "  all      Run all individual tests (default)"
    echo "  journey  Run complete user journey test"
    echo
    echo "Prerequisites:"
    echo "  - Maestro installed"
    echo "  - React Native app running"
    echo "  - Azure API accessible"
    echo
    echo "Examples:"
    echo "  $0           # Run all tests"
    echo "  $0 all       # Run all tests"
    echo "  $0 journey   # Run complete journey"
    echo
    exit 0
fi

# Run main function
main "$@" 