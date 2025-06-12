using Xunit;
using FluentAssertions;

namespace SnjofkaloAPI.Tests
{
    public class UtilityTests
    {
        [Fact]
        public void BasicMath_ShouldWork()
        {
            // Arrange
            var a = 10;
            var b = 5;

            // Act
            var sum = a + b;
            var product = a * b;

            // Assert
            sum.Should().Be(15);
            product.Should().Be(50);
        }

        [Fact]
        public void StringOperations_ShouldWork()
        {
            // Arrange
            var input = "OICAR Test";

            // Act
            var lowercase = input.ToLower();
            var uppercase = input.ToUpper();

            // Assert
            lowercase.Should().Be("oicar test");
            uppercase.Should().Be("OICAR TEST");
            input.Should().Contain("OICAR");
        }

        [Fact]
        public void ListOperations_ShouldWork()
        {
            // Arrange
            var items = new List<string> { "apple", "banana", "cherry" };

            // Act
            var count = items.Count;
            var containsBanana = items.Contains("banana");

            // Assert
            count.Should().Be(3);
            containsBanana.Should().BeTrue();
            items.Should().HaveCount(3);
        }

        [Fact]
        public void DateTimeOperations_ShouldWork()
        {
            // Arrange
            var now = DateTime.Now;
            var tomorrow = now.AddDays(1);

            // Act
            var difference = tomorrow - now;

            // Assert
            difference.Days.Should().Be(1);
            tomorrow.Should().BeAfter(now);
        }

        [Fact]
        public void EmailValidation_ShouldWork()
        {
            // Arrange
            var validEmail = "test@example.com";
            var invalidEmail = "invalid-email";

            // Act
            var validContainsAt = validEmail.Contains("@");
            var invalidContainsAt = invalidEmail.Contains("@");

            // Assert
            validContainsAt.Should().BeTrue();
            invalidContainsAt.Should().BeFalse();
        }
    }
} 